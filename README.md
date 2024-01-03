# MetGo

Metgo is a robust destination management application designed for both internal and external tourism. Utilizing cutting-edge technologies, our application ensures a seamless and efficient experience for travelers and organizers alike.

# Installation

### 1. Clone the repository 
Go to terminal
```
git clone https://github.com/metgodev/backend.git
```

### 2. Navigate to the backend directory
```
cd backend
```

###  3. Install Dependencies
Run the following commands to install dependencies. Node Version Manager (nvm) will automatically select the project's node version based on the specified version in the .nvmrc file in the root directory.
```
nvm install
nvm use
yarn install
```

### 4. Setup environment Variables
From the backend directory, copy the local.env.example file and create a new file local.env (which is ignored by Git):

```
cp local.env.example local.env
```
    Open local.env and consult your lead developer for the necessary API key values. 


### 5. Running the app

For each new instance of a ./backend terminal, run the command export DEV_CONFIG=local before starting the backend. This ensures that the configuration file (config.services.ts) detects your environment variables and connects to the database.

```
export DEV_CONFIG=local
yarn start:dev
```

## MetGo is now ready to revolutionize your tourism experiences!

<br>
<br>

# Technologies Used
MetGo has been created using the following technology:

- **Nest JS**: Framework for building scalable and maintainable server-side applications.
- **Node JS**: Backend runtime for executing server-side JavaScript code.
- **MongoDB**: NoSQL database for storing and managing data efficiently.
- **Flutter**: Framework for building natively compiled applications for mobile from a single codebase.
- **React JS**: Library for building user interfaces, used for developing the web application.

## Packages:
MetGo has used the following packages: 
- **Argan**: Utilized for password hashing, enhancing the security of user credentials.
- **JWT(JSON Web Tokens)**: Used for authentication of user, ensuring secure and token-based access control.
- **Swagger**: Integrated for API documentation, simplifying the understanding and usage of MetGo's backend APIs.

## Third-Party Integration
MetGo has used the following third party:

- **Google Cloud Platform (GCP)**: Utilized for storing media, providing a reliable and scalable solution for managing multimedia content in MetGo.
- **Google OAuth**: Facilitates the sign-in feature using Google accounts.
- **Mailchimp**: Used for sending emails and conducting marketing campaigns to user audiences.
- **PayPlus**: Integrated for seamless payment processing, ensuring a smooth financial transaction experience within the application.