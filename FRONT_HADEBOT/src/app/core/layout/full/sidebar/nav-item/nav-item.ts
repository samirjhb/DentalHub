import { Role } from '../../../../auth/enums/role.enum';

export interface NavItem {
    displayName?: string;
    iconName?: string;
    navCap?: string;
    route?: string;
    children?: NavItem[];
    chip?: boolean;
    chipContent?: string;
    chipClass?: string;
    external?: boolean;
    // Roles permitidos para ver esta entrada de menú. Sin este campo, la
    // entrada se muestra a cualquier usuario autenticado (ej. navCap, login/register).
    roles?: Role[];
}