import { Alert } from 'react-native';
import { Client, Account, ID, Avatars, Databases, Query } from 'react-native-appwrite';
//import { ENDPOINT, PLATFORM, PROJECT_ID, DATABASE_ID, USERS_COLLECTION_ID, COURSE_CONTENT_ID} from "@env";

export const config = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform:"com.innerReflections.mindfulPresence",
    projectId: "6738ad1c000fe7f98aba",
    databaseId: "6738cdd70004e2baba70",
    usersCollectionId: "6738cdee001433243d5b",
    courseContentCollectionId: "6741a8300027a250e4ee"

    
    // videosCollectionId: VIDEOS_COLLECTION_ID,
    // storageId: STORAGE_ID,
};

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    usersCollectionId,
    courseContentCollectionId,
    // videosCollectionId,
    // storageId
} = config;

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.

    const account = new Account(client);
    const avatars = new Avatars(client);
    const databases = new Databases(client);

    export const createUser = async(email, password, firstName, lastName) => {
        try {

            const newAccount= await account.create(
                ID.unique(),
                email,
                password,
                firstName,
                lastName
            )
            if (!newAccount) throw Error;
            
            await signIn(email, password);
            
            console.log('Before Entering CreateDocument')

            const newUser = await databases.createDocument(
                config.databaseId,
                config.usersCollectionId,

                ID.unique(),
                {
                    accountId: newAccount.$id,
                    firstName,
                    email,
                    lastName
                }
            )
                console.log('After Entering CreateDocument')

            if (!newUser) 
            {
                console.log("Inside If of create Document:"+error)
                throw Error;
            } 
            
            return newUser;
        } catch (error) {
            console.log('Error in catch of CreateDocument', error.message)
            Alert.alert('Error', error.message)
        }
     }
    
    export const signIn = async(email, password) =>
    {

        try {
            const session = await account.createEmailPasswordSession(email, password)
            return session;     
        } catch (error) {
            throw new Error(error);

        }
    }
        
    // export const getCurrentUser = async () =>
    // {
    //     try {
    //         const currentAccount = await account.get();
    //         if(!currentAccount) throw Error;
    
    //         const currentUser = await databases.listDocuments(
    //             config.databaseId,
    //             config.usersCollectionId,
    //             [Query.equal('accountId', currentAccount.$id)]
    //         )
    
    //         if(!currentUser) throw Error;
    
    //         return currentUser.documents[0];
    //     } catch (error) {
            
    //     }
    
    // }
    export const getCurrentUser = async () => {
        try {
            const currentAccount = await account.get();
            
            if (!currentAccount) throw new Error("No active account");
    
            // Fetch the user document from the database
            const currentUser = await databases.listDocuments(
                config.databaseId,
                config.usersCollectionId,
                [Query.equal('accountId', currentAccount.$id)]
            );
            
            
    
            if (!currentUser.documents || currentUser.documents.length === 0) {
                throw new Error("No user documents found");
            }
    
            // Extract the accountId and append "0000" to it
            const accountId = currentAccount.$id + "0000";  // Appending 4 zeros to accountId
            
            return {
                accountId: accountId,  // Return the modified accountId
                
            };
            
        } catch (error) {
            console.error("Error fetching current user:", error);
            throw error;
        }
    };
    
    
    export const getContent = async (contentId) => {
        try {
          const content = await databases.getDocument(
            config.databaseId,
            config.courseContentCollectionId,
            contentId
          );
          if (!content) throw new Error('Content not found');
          return content;
        } catch (error) {
          console.error('Error fetching content:', error.message);
          throw error;
        }
      };
      


    export const logout = async () => {
        try {
            await account.deleteSession('current'); // Ends the current session
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error.message);
            throw error; // Rethrow if you need to handle errors elsewhere
        }
    };
    