// API Helper - Supabase operations
// This file contains all database and storage interactions

// Initialize Supabase client
const supabaseClient = supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

const API = {
    // ==================== AUTHENTICATION ====================
    
    async signUp(email, password, fullName, role = 'parent') {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role
                }
            }
        });
        
        if (error) throw error;
        return data;
    },

    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser() {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return null;

        // Get additional user info from users table
        const { data: userData, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        // If user not found in users table, create a default profile
        if (error && error.code === 'PGRST116') {
            console.warn('User profile not found, creating default profile');

            // Get default church ID (trinity)
            const { data: defaultChurch } = await supabaseClient
                .from('churches')
                .select('id')
                .eq('slug', 'trinity')
                .single();

            const churchId = defaultChurch?.id || '00000000-0000-0000-0000-000000000001';

            // Create a basic user profile
            const { data: newUser, error: insertError } = await supabaseClient
                .from('users')
                .insert([{
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || user.email,
                    role: user.user_metadata?.role || 'parent',
                    church_id: churchId
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user profile:', insertError);
                throw insertError;
            }

            return newUser;
        }

        if (error) throw error;
        return userData;
    },

    async updateUserProfile(userId, updates) {
        const { data, error } = await supabaseClient
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Check if current user is an admin (used for role validation in admin functions)
    async isUserAdmin() {
        const user = await this.getCurrentUser();
        return user && user.role === 'admin';
    },

    // ==================== STUDENTS ====================

    async getMyStudents(churchId) {
        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .eq('church_id', churchId)
            .eq('parent_id', user.id)
            .order('full_name');

        if (error) throw error;
        return data;
    },

    async getAllStudents(churchId) {
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .eq('church_id', churchId)
            .order('full_name');

        if (error) throw error;
        return data;
    },

    async getStudent(studentId, churchId) {
        const { data, error } = await supabaseClient
            .from('students')
            .select('*')
            .eq('id', studentId)
            .eq('church_id', churchId)
            .single();

        if (error) throw error;
        return data;
    },

    async createStudent(studentData, churchId) {
        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('students')
            .insert([{ ...studentData, parent_id: user.id, church_id: churchId }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateStudent(studentId, updates, churchId) {
        const { data, error } = await supabaseClient
            .from('students')
            .update(updates)
            .eq('id', studentId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteStudent(studentId, churchId) {
        const { error } = await supabaseClient
            .from('students')
            .delete()
            .eq('id', studentId)
            .eq('church_id', churchId);

        if (error) throw error;
    },

    // ==================== PAYMENTS ====================

    async getPaymentSummary(studentId, churchId) {
        const { data, error } = await supabaseClient
            .from('payment_summaries')
            .select('*')
            .eq('student_id', studentId)
            .eq('church_id', churchId)
            .single();

        if (error) throw error;
        return data;
    },

    async getAllPaymentSummaries(churchId) {
        try {
            // Get all students for the church
            const { data: students, error: studentError } = await supabaseClient
                .from('students')
                .select('id, full_name, total_cost')
                .eq('church_id', churchId)
                .order('full_name');

            if (studentError) throw studentError;

            // Get all payments for the church
            const { data: payments, error: paymentError } = await supabaseClient
                .from('payments')
                .select('*')
                .eq('church_id', churchId);

            if (paymentError) throw paymentError;

            // Calculate summaries
            const summaries = students.map(student => {
                const studentPayments = payments.filter(p => p.student_id === student.id);
                const totalPaid = studentPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const totalCost = student.total_cost || 2500; // Default to 2500 if not set
                const balanceDue = totalCost - totalPaid;

                return {
                    student_id: student.id,
                    student_name: student.full_name,
                    total_cost: totalCost,
                    amount_paid: totalPaid,
                    balance_due: balanceDue,
                    status: balanceDue <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending'
                };
            });

            return summaries;
        } catch (error) {
            console.error('Error getting payment summaries:', error);
            return [];
        }
    },

    async getPaymentHistory(studentId, churchId) {
        const { data, error } = await supabaseClient
            .from('payments')
            .select('*')
            .eq('student_id', studentId)
            .eq('church_id', churchId)
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    async addPayment(studentId, amount, paymentDate, paymentType = '', notes = '', churchId) {
        const { data, error } = await supabaseClient
            .from('payments')
            .insert([{
                student_id: studentId,
                amount: amount,
                payment_date: paymentDate,
                payment_type: paymentType,
                notes: notes,
                church_id: churchId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updatePaymentConfig(studentId, totalCost, churchId) {
        const { data, error } = await supabaseClient
            .from('payment_config')
            .upsert([{
                student_id: studentId,
                total_cost: totalCost,
                church_id: churchId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ==================== DOCUMENTS ====================

    async uploadDocument(studentId, file, documentType = 'other', churchId) {
        const user = await this.getCurrentUser();
        const fileName = `${studentId}/${Date.now()}_${file.name}`;

        // Upload to storage
        const { data: storageData, error: storageError } = await supabaseClient.storage
            .from('documents')
            .upload(fileName, file);

        if (storageError) throw storageError;

        // Create database record
        const { data, error } = await supabaseClient
            .from('documents')
            .insert([{
                student_id: studentId,
                uploaded_by: user.id,
                file_name: file.name,
                file_path: storageData.path,
                file_type: file.type,
                document_type: documentType,
                church_id: churchId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getDocumentsForStudent(studentId, churchId) {
        const { data, error } = await supabaseClient
            .from('documents')
            .select('*')
            .eq('student_id', studentId)
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAllDocuments(churchId) {
        const { data, error } = await supabaseClient
            .from('documents')
            .select(`
                *,
                students (full_name),
                users (full_name)
            `)
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getDocumentUrl(filePath) {
        const { data } = supabaseClient.storage
            .from('documents')
            .getPublicUrl(filePath);
        
        return data.publicUrl;
    },

    async updateDocumentStatus(documentId, status, notes = '', churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to approve documents. Admin role required.');
        }

        const { data, error } = await supabaseClient
            .from('documents')
            .update({ status, notes })
            .eq('id', documentId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteDocument(documentId, filePath, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to delete documents. Admin role required.');
        }

        // Delete from storage
        const { error: storageError } = await supabaseClient.storage
            .from('documents')
            .remove([filePath]);

        if (storageError) throw storageError;

        // Delete from database
        const { error } = await supabaseClient
            .from('documents')
            .delete()
            .eq('id', documentId)
            .eq('church_id', churchId);

        if (error) throw error;
    },

    // ==================== TRIP MEMORIES ====================

    async submitTripMemory(studentId, title, content, photoFile = null, churchId) {
        let photoPath = null;

        // Upload photo if provided
        if (photoFile) {
            try {
                const timestamp = Date.now();
                const fileName = `${timestamp}_${photoFile.name}`;
                const filePath = `${churchId}/${studentId}/${fileName}`;

                console.log('Uploading file to path:', filePath);
                console.log('File details:', {
                    name: photoFile.name,
                    size: photoFile.size,
                    type: photoFile.type
                });

                const { data: storageData, error: storageError } = await supabaseClient.storage
                    .from('trip-photos')
                    .upload(filePath, photoFile, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: photoFile.type
                    });

                if (storageError) {
                    console.error('Storage error details:', {
                        message: storageError.message,
                        status: storageError.status,
                        statusCode: storageError.statusCode,
                        error: storageError
                    });

                    // If upload fails, we can still create the memory without the photo
                    console.warn('Photo upload failed, saving memory without photo');
                    photoPath = null;
                } else {
                    photoPath = storageData.path;
                    console.log('Photo uploaded successfully:', photoPath);
                }
            } catch (uploadError) {
                console.error('Photo upload exception:', uploadError);
                // Don't fail the entire submission - allow memory to be saved without photo
                console.warn('Continuing without photo due to upload error');
                photoPath = null;
            }
        }

        // Create memory record (with or without photo)
        const { data, error } = await supabaseClient
            .from('trip_memories')
            .insert([{
                student_id: studentId,
                title: title,
                content: content,
                photo_path: photoPath,
                church_id: churchId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getMemoriesForStudent(studentId, churchId) {
        const { data, error } = await supabaseClient
            .from('trip_memories')
            .select('*')
            .eq('student_id', studentId)
            .eq('church_id', churchId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAllMemories(churchId) {
        const { data, error } = await supabaseClient
            .from('trip_memories')
            .select(`
                *,
                students (full_name)
            `)
            .eq('church_id', churchId)
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getApprovedMemories(churchId) {
        const { data, error } = await supabaseClient
            .from('trip_memories')
            .select(`
                *,
                students (full_name)
            `)
            .eq('church_id', churchId)
            .eq('status', 'approved')
            .order('submitted_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getPhotoUrl(photoPath) {
        const { data } = supabaseClient.storage
            .from('trip-photos')
            .getPublicUrl(photoPath);
        
        return data.publicUrl;
    },

    async updateMemoryStatus(memoryId, status, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to approve memories. Admin role required.');
        }

        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('trip_memories')
            .update({
                status,
                approved_at: status === 'approved' ? new Date().toISOString() : null,
                approved_by: status === 'approved' ? user.id : null
            })
            .eq('id', memoryId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ==================== EVENTS ====================

    async getEvents(churchId) {
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('church_id', churchId)
            .eq('display_on_calendar', true)
            .order('event_date');

        if (error) throw error;
        return data;
    },

    async getAllEvents(churchId) {
        const { data, error } = await supabaseClient
            .from('events')
            .select('*')
            .eq('church_id', churchId)
            .order('event_date');

        if (error) throw error;
        return data;
    },

    async createEvent(eventData, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to create events. Admin role required.');
        }

        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('events')
            .insert([{ ...eventData, created_by: user.id, church_id: churchId }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateEvent(eventId, updates, churchId) {
        const { data, error } = await supabaseClient
            .from('events')
            .update(updates)
            .eq('id', eventId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteEvent(eventId, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to delete events. Admin role required.');
        }

        const { error } = await supabaseClient
            .from('events')
            .delete()
            .eq('id', eventId)
            .eq('church_id', churchId);

        if (error) throw error;
    },

    // ==================== RESOURCES ====================

    async getResources(churchId) {
        const { data, error } = await supabaseClient
            .from('resources')
            .select('*')
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async createResource(resourceData, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to create resources. Admin role required.');
        }

        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('resources')
            .insert([{ ...resourceData, created_by: user.id, church_id: churchId }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateResource(resourceId, updates, churchId) {
        const { data, error } = await supabaseClient
            .from('resources')
            .update(updates)
            .eq('id', resourceId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteResource(resourceId, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to delete resources. Admin role required.');
        }

        const { error } = await supabaseClient
            .from('resources')
            .delete()
            .eq('id', resourceId)
            .eq('church_id', churchId);

        if (error) throw error;
    },

    // ==================== USER QUESTIONS ====================

    async submitQuestion(email, question, questionType = 'question', churchId, attachmentPath = null) {
        const user = await this.getCurrentUser();

        // Build question data - only include fields that exist in the table
        const questionData = {
            user_id: user ? user.id : null,
            email: email,
            question: attachmentPath ? `${question}\n\n[Attachment: ${attachmentPath}]` : question,
            question_type: questionType,
            church_id: churchId
        };

        const { data, error } = await supabaseClient
            .from('user_questions')
            .insert([questionData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getUserQuestions(churchId) {
        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('user_questions')
            .select('*')
            .eq('church_id', churchId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAllUserQuestions(churchId) {
        const { data, error } = await supabaseClient
            .from('user_questions')
            .select('*, question_responses(*)')
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getPendingQuestions(churchId) {
        const { data, error } = await supabaseClient
            .from('user_questions')
            .select('*, question_responses(*)')
            .eq('church_id', churchId)
            .eq('status', 'submitted')
            .or('status.eq.pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async updateQuestionStatus(questionId, status, churchId) {
        const { data, error } = await supabaseClient
            .from('user_questions')
            .update({ status })
            .eq('id', questionId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteQuestion(questionId, churchId) {
        const { error } = await supabaseClient
            .from('user_questions')
            .delete()
            .eq('id', questionId)
            .eq('church_id', churchId);

        if (error) throw error;
        return true;
    },

    async submitQuestionResponse(questionId, response, isFaq = false, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to respond to questions. Admin role required.');
        }

        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('question_responses')
            .insert([{
                question_id: questionId,
                admin_id: user.id,
                response: response,
                is_faq: isFaq,
                church_id: churchId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getQuestionResponses(questionId, churchId) {
        const { data, error } = await supabaseClient
            .from('question_responses')
            .select('*')
            .eq('question_id', questionId)
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async markQuestionNotified(responseId) {
        const { data, error } = await supabaseClient
            .from('question_responses')
            .update({
                user_notified: true,
                notified_at: new Date().toISOString()
            })
            .eq('id', responseId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ==================== FAQs ====================

    async getFaqs(churchId) {
        const { data, error } = await supabaseClient
            .from('faqs')
            .select('*')
            .eq('church_id', churchId)
            .eq('display', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAllFaqs(churchId) {
        const { data, error } = await supabaseClient
            .from('faqs')
            .select('*')
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async createFaq(question, answer, category = null, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to create FAQs. Admin role required.');
        }

        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('faqs')
            .insert([{
                question: question,
                answer: answer,
                category: category,
                created_by: user.id,
                church_id: churchId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateFaq(faqId, updates, churchId) {
        const { data, error } = await supabaseClient
            .from('faqs')
            .update(updates)
            .eq('id', faqId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteFaq(faqId, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to delete FAQs. Admin role required.');
        }

        const { error } = await supabaseClient
            .from('faqs')
            .delete()
            .eq('id', faqId)
            .eq('church_id', churchId);

        if (error) throw error;
    },

    // ==================== CONTENT ITEMS ====================

    async getContentItems(section, churchId) {
        const { data, error } = await supabaseClient
            .from('content_items')
            .select('*')
            .eq('section', section)
            .eq('church_id', churchId)
            .eq('display', true)
            .order('order_index');

        if (error) throw error;
        return data;
    },

    async getAllContentItems(section, churchId) {
        const { data, error } = await supabaseClient
            .from('content_items')
            .select('*')
            .eq('section', section)
            .eq('church_id', churchId)
            .order('order_index');

        if (error) throw error;
        return data;
    },

    async createContentItem(section, title, content, orderIndex = 0, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to create content. Admin role required.');
        }

        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('content_items')
            .insert([{
                section: section,
                title: title,
                content: content,
                order_index: orderIndex,
                created_by: user.id,
                church_id: churchId
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateContentItem(contentId, updates, churchId) {
        const { data, error } = await supabaseClient
            .from('content_items')
            .update(updates)
            .eq('id', contentId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteContentItem(contentId, churchId) {
        // Admin role check
        const isAdmin = await this.isUserAdmin();
        if (!isAdmin) {
            throw new Error('You do not have permission to delete content. Admin role required.');
        }

        const { error } = await supabaseClient
            .from('content_items')
            .delete()
            .eq('id', contentId)
            .eq('church_id', churchId);

        if (error) throw error;
    },

    // ==================== USER MANAGEMENT ====================

    async getChurchUsers(churchId) {
        const { data, error } = await supabaseClient
            .from('users')
            .select('id, email, full_name, role, church_id, created_at')
            .eq('church_id', churchId)
            .order('email');

        if (error) throw error;
        return data;
    },

    async promoteUserToAdmin(userId, churchId) {
        // Only super admins can promote users
        const currentUser = await this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('You do not have permission to promote users. Super admin role required.');
        }

        const { data, error } = await supabaseClient
            .from('users')
            .update({ role: 'admin' })
            .eq('id', userId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async demoteUserFromAdmin(userId, churchId) {
        // Only super admins can demote users
        const currentUser = await this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            throw new Error('You do not have permission to demote users. Super admin role required.');
        }

        const { data, error } = await supabaseClient
            .from('users')
            .update({ role: 'parent' })
            .eq('id', userId)
            .eq('church_id', churchId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // ==================== STUDENT ENROLLMENT ====================

    // Generate random invite token
    generateInviteToken(length = 64) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < length; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    },

    // Send invite to student
    async sendStudentInvite(studentId, studentEmail, churchId) {
        const user = await this.getCurrentUser();
        const inviteToken = this.generateInviteToken(64);

        const { data, error } = await supabaseClient
            .from('student_invites')
            .insert([{
                student_id: studentId,
                parent_id: user.id,
                church_id: churchId,
                invite_token: inviteToken,
                student_email: studentEmail,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            inviteUrl: `${window.location.origin}/student-signup.html?invite=${inviteToken}&church=${this.getChurchSlug()}`
        };
    },

    // Verify invite token (get invite details)
    async verifyStudentInvite(inviteToken, churchSlug) {
        // Get church ID from slug
        const churchId = await this.getChurchIdFromSlug(churchSlug);

        const { data: invite, error } = await supabaseClient
            .from('student_invites')
            .select('*')
            .eq('invite_token', inviteToken)
            .eq('church_id', churchId)
            .single();

        if (error) throw new Error('Invalid invite token');

        // Check if expired
        if (new Date(invite.expires_at) < new Date()) {
            throw new Error('Invite has expired');
        }

        // Check if already accepted
        if (invite.status !== 'pending') {
            throw new Error('Invite already used');
        }

        // Get student name from students table
        const { data: student, error: studentError } = await supabaseClient
            .from('students')
            .select('full_name')
            .eq('id', invite.student_id)
            .single();

        if (studentError) {
            console.error('Error getting student:', studentError);
            throw new Error('Could not find student');
        }

        return {
            invite_id: invite.id,
            student_id: invite.student_id,
            student_name: student.full_name,
            student_email: invite.student_email,
            church_slug: churchSlug,
            church_id: churchId
        };
    },

    // Accept invite and create user account link
    async acceptStudentInvite(inviteId, userId, studentId, studentEmail) {
        console.log('acceptStudentInvite called with:', {
            inviteId,
            userId,
            studentId,
            studentEmail
        });

        // Update invite to accepted
        const { error: updateError } = await supabaseClient
            .from('student_invites')
            .update({
                status: 'accepted',
                accepted_at: new Date()
            })
            .eq('id', inviteId);

        if (updateError) {
            console.error('Error updating invite:', updateError);
            throw updateError;
        }

        console.log('Invite updated successfully');

        // Link student to user account and store email
        const { error: linkError } = await supabaseClient
            .from('students')
            .update({
                user_id: userId,
                email: studentEmail
            })
            .eq('id', studentId);

        if (linkError) {
            console.error('Error linking student to user:', linkError);
            console.error('Details:', {
                studentId,
                userId,
                studentEmail
            });
            throw linkError;
        }

        console.log('Student linked to user successfully');
        return true;
    },

    // Get pending invites for a student (for parent to see status)
    async getStudentInviteStatus(studentId, churchId) {
        const { data, error } = await supabaseClient
            .from('student_invites')
            .select('*')
            .eq('student_id', studentId)
            .eq('church_id', churchId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            const invite = data[0];
            return {
                hasInvite: true,
                status: invite.status,
                email: invite.student_email,
                sent_at: invite.created_at,
                accepted_at: invite.accepted_at
            };
        }

        return { hasInvite: false };
    },

    // Helper to get current church slug from URL
    getChurchSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get('church') || sessionStorage.getItem('currentChurch') || 'trinity';
    },

    // Helper to get church ID from slug
    async getChurchIdFromSlug(churchSlug) {
        const { data, error } = await supabaseClient
            .from('churches')
            .select('id')
            .eq('slug', churchSlug)
            .single();

        if (error) {
            console.error('Error getting church ID from slug:', error);
            throw new Error(`Church not found: ${churchSlug}`);
        }

        return data.id;
    },

    // ==================== TENANT ADMIN MANAGEMENT ====================

    /**
     * Get current user's admin info (if they're an admin)
     * Returns: { id, email, role, admin_churches: [UUIDs] } or null
     */
    async getCurrentAdmin() {
        const user = await this.getCurrentUser();

        if (!user || user.role !== 'admin') {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            role: 'admin',
            admin_churches: user.admin_churches || [],
            is_super_admin: user.admin_churches && user.admin_churches.length > 0
        };
    },

    /**
     * Check if current admin can manage a specific church
     * Returns: true/false
     */
    async canAdministerChurch(churchId) {
        const admin = await this.getCurrentAdmin();

        if (!admin) return false;

        // Super admin can manage any church (has all churches)
        if (admin.is_super_admin && admin.admin_churches.length > 0) {
            return admin.admin_churches.includes(churchId);
        }

        return false;
    },

    /**
     * Get all churches this admin can manage
     * Returns: [ { id, name, slug }, ... ]
     */
    async getAdminChurches() {
        const admin = await this.getCurrentAdmin();

        if (!admin || admin.admin_churches.length === 0) {
            return [];
        }

        try {
            const { data: churches, error } = await supabaseClient
                .from('churches')
                .select('id, name, slug')
                .in('id', admin.admin_churches)
                .order('name');

            if (error) throw error;

            return churches || [];
        } catch (error) {
            console.error('Error getting admin churches:', error);
            return [];
        }
    },

    /**
     * Add a user as admin for a specific church
     * adminEmail: email of user to make admin
     * churchId: UUID of church
     */
    async addAdminToChurch(adminEmail, churchId) {
        // First, get or create the user with admin role
        const { data: existingUser } = await supabaseClient
            .from('users')
            .select('id, admin_churches')
            .eq('email', adminEmail)
            .single();

        let userId;

        if (existingUser) {
            userId = existingUser.id;
            // Check if already admin for this church
            if (existingUser.admin_churches && existingUser.admin_churches.includes(churchId)) {
                return {
                    success: true,
                    message: 'Admin already assigned to this church'
                };
            }
        } else {
            // User doesn't exist yet - will be created when they sign up
            return {
                success: false,
                message: 'User must sign up first before being assigned as admin'
            };
        }

        // Update user with new church in admin_churches array
        const currentChurches = existingUser.admin_churches || [];
        const updatedChurches = [...currentChurches, churchId];

        const { error } = await supabaseClient
            .from('users')
            .update({
                role: 'admin',
                admin_churches: updatedChurches
            })
            .eq('id', userId);

        if (error) throw error;

        return {
            success: true,
            message: `Added ${adminEmail} as admin for church ${churchId}`
        };
    },

    /**
     * Remove a user as admin from a specific church
     * adminEmail: email of admin user
     * churchId: UUID of church
     */
    async removeAdminFromChurch(adminEmail, churchId) {
        const { data: user, error: fetchError } = await supabaseClient
            .from('users')
            .select('id, admin_churches, role')
            .eq('email', adminEmail)
            .single();

        if (fetchError) throw fetchError;

        if (!user || !user.admin_churches || user.admin_churches.length === 0) {
            return {
                success: false,
                message: 'User is not an admin'
            };
        }

        // Remove church from admin_churches array
        const updatedChurches = user.admin_churches.filter(id => id !== churchId);

        // Build update object based on whether they still have churches
        const updateObj = {};
        if (updatedChurches.length === 0) {
            // If no more churches, set role to parent and clear admin_churches
            updateObj.role = 'parent';
            updateObj.admin_churches = null;
        } else {
            // Otherwise keep as admin with remaining churches
            updateObj.admin_churches = updatedChurches;
        }

        const { error } = await supabaseClient
            .from('users')
            .update(updateObj)
            .eq('id', user.id);

        if (error) throw error;

        return {
            success: true,
            message: `Removed ${adminEmail} as admin from church ${churchId}`
        };
    },

    /**
     * Get all admins for a specific church
     * churchId: UUID of church
     * Returns: [ { id, email, admin_churches }, ... ]
     */
    async getChurchAdmins(churchId) {
        try {
            const { data: admins, error } = await supabaseClient
                .from('users')
                .select('id, email, admin_churches')
                .eq('role', 'admin')
                .contains('admin_churches', [churchId]);

            if (error) throw error;

            return admins || [];
        } catch (error) {
            console.error('Error getting church admins:', error);
            return [];
        }
    },

    /**
     * Get all users that can be made admins (existing users)
     * Returns: [ { id, email, role, admin_churches }, ... ]
     */
    async getAvailableAdmins(churchId) {
        try {
            // Get all users first, then filter in JavaScript to avoid array syntax issues
            const { data: users, error } = await supabaseClient
                .from('users')
                .select('id, email, role, admin_churches')
                .order('email');

            if (error) throw error;

            // Filter out users who are already admins for this church
            return (users || []).filter(user => {
                // Include if user is not an admin or doesn't have this church in their admin_churches
                return !user.admin_churches || !user.admin_churches.includes(churchId);
            });
        } catch (error) {
            console.error('Error getting available admins:', error);
            return [];
        }
    },

    // ==================== PARENT MANAGEMENT ====================

    /**
     * Get all parents for a specific church
     * Returns: [ { id, email, full_name, phone, created_at }, ... ]
     */
    async getAllParents(churchId) {
        try {
            const { data: parents, error } = await supabaseClient
                .from('users')
                .select('id, email, full_name, phone, created_at')
                .eq('role', 'parent')
                .eq('church_id', churchId)
                .order('full_name');

            if (error) throw error;
            return parents || [];
        } catch (error) {
            console.error('Error getting parents:', error);
            return [];
        }
    },

    /**
     * Get a specific parent by ID
     */
    async getParent(parentId) {
        try {
            const { data: parent, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', parentId)
                .single();

            if (error) throw error;
            return parent;
        } catch (error) {
            console.error('Error getting parent:', error);
            return null;
        }
    },

    /**
     * Create a new parent account (admin creating account)
     */
    async createParent(parentData, churchId) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .insert([{
                    email: parentData.email,
                    full_name: parentData.full_name,
                    phone: parentData.phone || null,
                    role: 'parent',
                    church_id: churchId
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating parent:', error);
            throw error;
        }
    },

    /**
     * Update a parent's information
     */
    async updateParent(parentId, updates, churchId) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .update(updates)
                .eq('id', parentId)
                .eq('church_id', churchId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating parent:', error);
            throw error;
        }
    },

    /**
     * Delete a parent account
     */
    async deleteParent(parentId, churchId) {
        try {
            const { error } = await supabaseClient
                .from('users')
                .delete()
                .eq('id', parentId)
                .eq('church_id', churchId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting parent:', error);
            throw error;
        }
    },

    /**
     * Get number of students for a parent
     */
    async getParentStudentCount(parentId) {
        try {
            const { data, error } = await supabaseClient
                .from('students')
                .select('id', { count: 'exact', head: true })
                .eq('parent_id', parentId);

            if (error) throw error;
            return data?.length || 0;
        } catch (error) {
            console.error('Error getting parent student count:', error);
            return 0;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
