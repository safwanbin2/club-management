---
name: Academic Operations System
colors:
  surface: '#fff8f8'
  surface-dim: '#e9d5d8'
  surface-bright: '#fff8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff0f2'
  surface-container: '#fde9ec'
  surface-container-high: '#f7e3e7'
  surface-container-highest: '#f2dee1'
  on-surface: '#23191b'
  on-surface-variant: '#554246'
  inverse-surface: '#392d30'
  inverse-on-surface: '#ffecef'
  outline: '#887176'
  outline-variant: '#dbc0c5'
  surface-tint: '#a4355d'
  primary: '#43001d'
  on-primary: '#ffffff'
  primary-container: '#6a0032'
  on-primary-container: '#f1719a'
  inverse-primary: '#ffb1c5'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#00240e'
  on-tertiary: '#ffffff'
  tertiary-container: '#003c1b'
  on-tertiary-container: '#71a87d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9e1'
  primary-fixed-dim: '#ffb1c5'
  on-primary-fixed: '#3f001b'
  on-primary-fixed-variant: '#851b46'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#b6f0c0'
  tertiary-fixed-dim: '#9bd4a5'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#1b512d'
  background: '#fff8f8'
  on-background: '#23191b'
  surface-variant: '#f2dee1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 260px
  topbar-height: 64px
---

## Brand & Style

This design system is built for administrative efficiency and high-utility data management. The aesthetic leans heavily into **Modern Corporate Minimalism**, prioritizing information density, legibility, and a clear visual hierarchy. It avoids all decorative flourishes to focus entirely on the operational needs of university staff and club leaders.

The interface should feel reliable and "built-in" to the university ecosystem. It utilizes a structured, grid-based layout with a focus on functional clarity. Surfaces are distinct but subtle, using thin borders and soft tonal shifts rather than aggressive shadows or vibrant gradients. The emotional response is one of professional confidence and systematic order.

## Colors

The palette is anchored by the university's institutional Maroon (`#6A0032`), used strategically for primary actions, active navigation states, and brand identifiers. 

- **Primary:** Used for the "High Emphasis" buttons and the active indicator in the sidebar.
- **Neutral/Text:** We avoid pure black (`#000000`) to reduce eye strain. All primary text uses Slate (`#334155`), while secondary/de-emphasized text uses a lighter shade of slate.
- **Surfaces:** The main canvas is pure white. Secondary containers, sidebars, and "read-only" background areas use a crisp Off-White (`#F8F9FA`) to create a subtle layered effect.
- **Borders:** A consistent light grey border is used for table rows, input fields, and card containers to maintain structure without adding visual weight.

## Typography

The system utilizes **Inter** for its exceptional legibility in data-heavy environments. It is a systematic, utilitarian typeface that performs well at small sizes—crucial for tables and dashboards.

- **Headlines:** Use a tighter letter-spacing and heavier weights to establish clear section starts.
- **Body Text:** Standardized at 14px for most operational views to maximize information density while remaining accessible.
- **Labels:** Uppercase labels with slight tracking (letter-spacing) are used for table headers and small metadata categories.
- **Mono Support:** For any ID numbers or financial figures, a monospaced variant of Inter (or system-mono) should be used to ensure numerical alignment in columns.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 260px, while the main content area fluidly expands.

- **The Grid:** A 12-column grid is used within the main content area for dashboard widgets and forms.
- **Margins:** A consistent 24px padding is applied to all main containers. 
- **Density:** To achieve "operational density," vertical spacing between table rows and form fields is kept tight (8px to 12px), allowing users to see more data without scrolling.
- **Breakpoints:** 
  - *Desktop (1280px+):* Full sidebar visible.
  - *Tablet (768px - 1279px):* Sidebar collapses to icons only; margins reduce to 16px.
  - *Mobile (<767px):* Sidebar becomes a hidden drawer; content stacks vertically.

## Elevation & Depth

This system uses a "Flat-Plus" approach. Depth is communicated through tonal changes and extremely subtle shadows rather than high-contrast depth.

- **Level 0 (Base):** The main background (`#FFFFFF`).
- **Level 1 (Surfaces):** Cards and main containers. They feature a 1px border of `#E2E8F0` and a "Soft Wash" shadow: `0px 1px 3px rgba(0, 0, 0, 0.05)`.
- **Level 2 (Overlays):** Dropdowns and filter menus. These use a more pronounced shadow to separate them from the content: `0px 10px 15px -3px rgba(0, 0, 0, 0.1)`.
- **Active State:** Selected items in lists or menus use a subtle background tint of the primary color at 5-8% opacity, paired with a 3px vertical "accent bar" on the left edge.

## Shapes

The shape language is **Soft**. A base radius of 4px (`0.25rem`) is applied to almost all elements, including buttons, input fields, and small cards. 

- **Buttons & Inputs:** 4px radius for a crisp, professional look.
- **Main Cards:** May use up to 8px (`rounded-lg`) to differentiate large content blocks from smaller UI widgets.
- **Data Visualizations:** Bar charts and progress bars should use flat ends or a very small 2px radius to maintain a technical feel. 
- **Avatars:** Circular (100% radius) to provide a single point of organic contrast against the otherwise rectangular UI.

## Components

- **Buttons:** Primary buttons are solid Maroon (`#6A0032`) with white text. Secondary buttons use a white background with a Slate border and text. Ghost buttons (no border) are used for low-priority actions in tables.
- **Input Fields:** Use a 1px border (`#E2E8F0`). On focus, the border changes to Maroon with a subtle 2px glow of the same color at 15% opacity. Labels are always positioned above the input in `label-md` style.
- **Tables:** This is the core component. Header rows have a light grey background (`#F8F9FA`). Row dividers are 1px thick. Cells use `body-md` typography. Zebra striping is not required; use hover-highlighting instead.
- **Cards:** Used to wrap dashboard widgets. They must include a title bar with an optional action slot (e.g., "View All" link).
- **Chips/Badges:** Used for status (e.g., "Active", "Pending"). They use a "Tonal" style: a light background version of the status color with high-contrast text. For example, a "Pending" badge uses a light amber background with dark amber text.
- **Sidebar:** The sidebar is the primary navigation. Icons should be line-art style (20px), paired with `body-md` text. The active item is marked by the Maroon color and a bold font weight.