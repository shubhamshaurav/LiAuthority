export const validatePassword = (password: string) => {
    const requirements = [
        { label: 'At least 8 characters', regex: /.{8,}/ },
        { label: 'At least one uppercase letter', regex: /[A-Z]/ },
        { label: 'At least one lowercase letter', regex: /[a-z]/ },
        { label: 'At least one number', regex: /[0-9]/ },
        { label: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
    ];

    const failed = requirements.find(req => !req.regex.test(password));

    return {
        isValid: !failed,
        message: failed ? failed.label : null,
        requirements: requirements.map(req => ({
            label: req.label,
            met: req.regex.test(password)
        }))
    };
};
