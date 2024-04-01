export const gitJsonCorrect = {
	orgId: 2,
	region: "us",
	locale: "en-US",
	data: {
		common: {
			sing_in: "Sign In",
			sing_up: "Sign Up",
		},
		pages: {
			home: {
				welcome_message: "Welcome to our website",
				about_us: "About Us",
			},
			contact: {
				phone: "Phone",
				email: "Email",
				details: {
					phone_number: "+123456789",
					email_address: "example@example.com",
				},
			},
		},
		errors: {
			404: "Page Not Found",
			500: "Internal Server Error",
			messages: {
				404: "The page you are looking for could not be found.",
				500: "We encountered an internal server error. Please try again later.",
			},
		},
	},
};

export const gitJsonIncorrect = {
	data: {
		common: {
			sing_in: "Sign In",
			sing_up: "Sign Up",
		},
		pages: {
			home: {
				welcome_message: "Welcome to our website",
				about_us: "About Us",
			},
			contact: {
				phone: "Phone",
				email: "Email",
				details: {
					phone_number: "+123456789",
					email_address: "example@example.com",
				},
			},
		},
		errors: {
			404: "Page Not Found",
			500: "Internal Server Error",
			messages: {
				404: "The page you are looking for could not be found.",
				500: "We encountered an internal server error. Please try again later.",
			},
		},
	},
};

export const gitJsonChange = {
	orgId: 2,
	region: "us",
	locale: "en-US",
	data: {
		common: {
			sing_in: "Sign In",
			sing_up: "Sign Up",
		},
		pages: {
			home: {
				welcome_message: "Welcome to our website",
				about_us: "About Us",
			},
			contact: {
				phone: "Phone",
				email: "Email",
				details: {
					phone_number: "+123456789",
					email_address: "example@example.com",
				},
			},
		},
		errors: {
			404: "Page Not Found Check",
			messages: {
				404: "The page you are looking for could not be found.",
				500: "We encountered an internal server error. Please try again later.",
			},
		},
	},
};
