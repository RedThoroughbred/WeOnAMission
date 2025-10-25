# WeOnAMission UI Design System

## Overview

The application now features a modern, professional design system with a carefully chosen color palette and cohesive visual language across all pages.

## Color Palette

### Primary Colors
- **Primary**: `#4F46E5` (Indigo) - Main brand color for buttons, links, and primary actions
- **Primary Dark**: `#4338CA` (Dark Indigo) - Hover and active states
- **Primary Light**: `#818CF8` (Light Indigo) - Backgrounds and accents

### Secondary Colors
- **Secondary**: `#06B6D4` (Cyan) - Complementary accent color
- **Secondary Dark**: `#0891B2` (Dark Cyan)
- **Secondary Light**: `#22D3EE` (Light Cyan)

### Semantic Colors
- **Success**: `#10B981` (Green) - Positive actions, approved status
- **Success Light**: `#D1FAE5` (Light Green)
- **Warning**: `#F59E0B` (Amber) - Caution, pending status
- **Warning Light**: `#FEF3C7` (Light Amber)
- **Danger**: `#EF4444` (Red) - Errors, critical actions
- **Danger Light**: `#FEE2E2` (Light Red)

### Neutral Colors
- **Gray 50**: `#F9FAFB` - Lightest background
- **Gray 100**: `#F3F4F6` - Secondary background
- **Gray 200**: `#E5E7EB` - Borders, dividers
- **Gray 300**: `#D1D5DB`
- **Gray 400**: `#9CA3AF`
- **Gray 500**: `#6B7280` - Secondary text
- **Gray 600**: `#4B5563` - Secondary buttons
- **Gray 700**: `#374151` - Headings
- **Gray 800**: `#1F2937` - Primary text
- **Gray 900**: `#111827` - Darkest

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

This ensures modern, clean typography across all devices.

### Font Sizes & Weights
- **H1**: 2rem, weight 700
- **H2**: 1.5rem, weight 700
- **H3**: 1.25rem, weight 700
- **Body**: 1rem, weight 400
- **Small**: 0.875rem, weight 400
- **Button**: 0.95rem, weight 600

## Components

### Buttons

**Primary Button** (Default)
```html
<button class="btn">Click Me</button>
```
- Background: Indigo `#4F46E5`
- Hover: Darker Indigo `#4338CA`
- Shadow: Subtle elevation
- Border Radius: 8px

**Success Button**
```html
<button class="btn btn-success">Approve</button>
```
- Green background for positive actions

**Danger Button**
```html
<button class="btn btn-danger">Delete</button>
```
- Red background for destructive actions

**Secondary Button**
```html
<button class="btn btn-secondary">Cancel</button>
```
- Gray background for neutral actions

### Form Inputs

All form inputs (`input`, `select`, `textarea`) have:
- Border: 2px solid light gray (`#E5E7EB`)
- Focus Border: Indigo primary color
- Focus Shadow: Subtle blue glow
- Border Radius: 8px
- Transition: All changes animated over 0.3s

### Cards

Elevation and Interaction:
- Base Shadow: `0 1px 3px rgba(0,0,0,0.08)` (subtle)
- Hover Shadow: `0 4px 12px rgba(0,0,0,0.12)` (lifted)
- Border: 1px light gray
- Hover Border: Primary light color
- Transition: Smooth 0.3s ease

### Messages & Alerts

**Success Message**
- Background: Light green `#D1FAE5`
- Text: Dark green `#065f46`
- Border Left: Green `#10B981`

**Error Message**
- Background: Light red `#FEE2E2`
- Text: Dark red `#991b1b`
- Border Left: Red `#EF4444`

**Warning Message**
- Background: Light amber `#FEF3C7`
- Text: Dark amber `#92400e`
- Border Left: Amber `#F59E0B`

### Tables

- Header Background: Light gray `#F3F4F6`
- Row Hover: Very light gray `#F9FAFB`
- Borders: Light gray `#E5E7EB`
- Shadows: Subtle elevation

### Modals

- Backdrop: Semi-transparent black (30%) with blur effect
- Content Background: White
- Animation: Fade in and slide up (300ms)
- Border: Subtle light gray
- Shadow: Strong drop shadow for depth

### Badges

Color-coded status indicators:
- **Success**: Green background with dark green text
- **Warning**: Amber background with dark amber text
- **Danger**: Red background with dark red text
- **Info**: Light indigo background with dark indigo text

## Spacing Scale

Used consistently throughout the design:
- 0.25rem (4px)
- 0.5rem (8px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)
- 3rem (48px)

## Border Radius

- Small elements: 6px (badges, small buttons)
- Medium elements: 8px (inputs, buttons, cards)
- Large elements: 12px (cards, modals)

## Shadows

Elevation system for depth:
- **Level 1** (subtle): `0 1px 3px rgba(0,0,0,0.08)`
- **Level 2** (light): `0 2px 8px rgba(0,0,0,0.12)`
- **Level 3** (medium): `0 4px 12px rgba(0,0,0,0.15)`
- **Level 4** (strong): `0 10px 40px rgba(0,0,0,0.2)`

## Animations

All transitions use:
- Duration: 0.3s
- Easing: `ease` or `cubic-bezier` for smoothness
- Properties: color, background, border, transform, box-shadow

### Key Animations
- Button hover: Small translate up (2px) + shadow increase
- Modal appear: Fade in + slide up
- Focus state: Border color + glow effect

## Responsive Design

- **Tablet & Up** (768px+): Full layout
- **Mobile** (Below 768px): Stacked layout, smaller padding

## Usage in HTML Pages

### Importing Styles
```html
<link rel="stylesheet" href="styles.css">
```

### Color Variables in Custom CSS
```css
/* Use CSS variables for consistency */
color: var(--primary);
background: var(--success-light);
border: 1px solid var(--border-light);
```

## Implementation Checklist

- [x] Color palette defined with CSS variables
- [x] Typography system established
- [x] Button styles (primary, success, danger, secondary)
- [x] Form input styling with focus states
- [x] Card layout with hover effects
- [x] Table styling
- [x] Modal design with animations
- [x] Badge system for status indicators
- [x] Alert/message components
- [x] Responsive design
- [x] Accessibility (color contrast, focus states)
- [x] Shadow elevation system

## Customization

To change the primary color throughout the app, update the CSS variable:

```css
:root {
    --primary: #YOUR_COLOR;
    --primary-dark: #DARKER_SHADE;
    --primary-light: #LIGHTER_SHADE;
}
```

All components automatically use the new color.

## Accessibility

The design system ensures:
- **Color Contrast**: All text meets WCAG AA standards (4.5:1 for normal text)
- **Focus States**: Clear visual indication on all interactive elements
- **Keyboard Navigation**: All buttons and forms are keyboard accessible
- **Semantic HTML**: Proper heading hierarchy and semantic tags

## Design Principles

1. **Consistency**: All buttons, cards, and components follow the same rules
2. **Clarity**: Clear visual hierarchy with font sizes and weights
3. **Feedback**: All interactions have clear visual feedback (hover, focus, active)
4. **Accessibility**: Design works for everyone, including those with color blindness
5. **Performance**: Smooth animations use GPU-accelerated properties
6. **Simplicity**: Clean, minimal design without excessive decoration
