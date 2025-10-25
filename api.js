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
        const { data, error } = await supabaseClient
            .from('payment_summaries')
            .select('*')
            .eq('church_id', churchId)
            .order('student_name');

        if (error) throw error;
        return data;
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
            const fileName = `${studentId}/${Date.now()}_${photoFile.name}`;
            const { data: storageData, error: storageError } = await supabaseClient.storage
                .from('trip-photos')
                .upload(fileName, photoFile);

            if (storageError) throw storageError;
            photoPath = storageData.path;
        }

        // Create memory record
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

    async submitQuestion(email, question, questionType = 'question', churchId) {
        const user = await this.getCurrentUser();
        const { data, error } = await supabaseClient
            .from('user_questions')
            .insert([{
                user_id: user ? user.id : null,
                email: email,
                question: question,
                question_type: questionType,
                church_id: churchId
            }])
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
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
