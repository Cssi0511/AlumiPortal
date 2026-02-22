const API_URL = 'https://script.google.com/macros/s/AKfycbz55VNk3Z-2f8ylurZqezswIyQ87L4bZlRjpNWUEDkxi1_zVbzd-2N03yUXWrJUgE15/exec';

export interface AlumniMember {
    email: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    yearOfGraduation: string;
    house: string;
    class: string;
    city: string;
    stateProvince: string;
    country: string;
    currentOccupation: string;
    industryField: string;
    companyOrganization: string;
    linkedinProfile: string;
    activelyInvolved: string;
    memberId: string;
    // Additional fields from original form
    committeePreference?: string;
    membershipDues?: string;
    sustainableAmount?: string;
    emergencyFullName?: string;
    emergencyRelationship?: string;
    emergencyPhone?: string;
    declaration?: string;
}

export interface DuesData {
    found: boolean;
    memberId: string;
    fullName: string;
    totalAmountPaid: number;
    outstanding: number;
    monthlyDue: number;
    totalAssessed: number;
    paidMonthCount: number;
    unpaidMonthCount: number;
    nextDueDate: string;
    nextDueAmount: number;
    paidMonths: string[];
    unpaidMonths: string[];
    dues2025: Record<string, number>;
    dues2026: Record<string, number>;
    dues2027: Record<string, number>;
}

export const api = {
    async fetchMembers(): Promise<AlumniMember[]> {
        try {
            const response = await fetch(`${API_URL}?action=getAllMembers`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data.success ? data.members : []; // Assuming backend returns { success: true, members: [] }
        } catch (error) {
            console.error('Error fetching members:', error);
            return [];
        }
    },

    async login(email: string): Promise<AlumniMember | null> {
        try {
            const response = await fetch(`${API_URL}?action=getUser&identifier=${encodeURIComponent(email)}`);
            if (!response.ok) throw new Error('Login failed');
            const data = await response.json();
            console.log('Login Response:', data);
            return data.success ? data.user : null;
        } catch (error) {
            console.error('Login error:', error);
            return null;
        }
    },

    async register(memberData: Partial<AlumniMember>): Promise<{ success: boolean; message: string; memberId?: string }> {
        try {
            // Mapping React partial data to full required object shape
            const userData = {
                email: memberData.email || '',
                fullName: memberData.fullName || '',
                phoneNumber: memberData.phoneNumber || '',
                dateOfBirth: memberData.dateOfBirth || '',
                gender: memberData.gender || '',
                yearOfGraduation: memberData.yearOfGraduation || '',
                house: memberData.house || '',
                class: memberData.class || '',
                city: memberData.city || '',
                stateProvince: memberData.stateProvince || '',
                country: memberData.country || '',
                currentOccupation: memberData.currentOccupation || '',
                industryField: memberData.industryField || '',
                companyOrganization: memberData.companyOrganization || '',
                linkedinProfile: memberData.linkedinProfile || '',
                activelyInvolved: memberData.activelyInvolved || 'Maybe',
                committeePreference: '',
                membershipDues: 'Yes',
                sustainableAmount: '',
                emergencyFullName: '',
                emergencyRelationship: '',
                emergencyPhone: '',
                declaration: 'I agree'
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'addUser',
                    userData: userData
                })
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed due to network error' };
        }
    },

    async updateProfile(email: string, updates: Partial<AlumniMember>): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'editUser',
                    identifier: email,
                    updates: updates
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
            return { success: false, message: 'Update failed' };
        }
    },

    async sendContactRequest(data: any): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'sendContactRequest',
                    data: data
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Contact request error:', error);
            return { success: false, message: 'Failed to send message' };
        }
    },

    async getDues(memberId: string): Promise<DuesData | null> {
        try {
            const params = new URLSearchParams({
                action: 'getDues',
                memberId: memberId,
            });
            const response = await fetch(`${API_URL}?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch dues');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching dues:', error);
            return null;
        }
    }
};
