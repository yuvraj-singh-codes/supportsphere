import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function connectToDatabase() {
    try {
        await prisma.$connect();
        console.log('Connected to the PostgreSQL database successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
}

async function disconnectFromDatabase() {
    try {
        await prisma.$disconnect();
        console.log('Disconnected from the PostgreSQL database.');
    } catch (error) {
        console.error('Error disconnecting from the database:', error);
    }
}

// Example model creation
async function createUser(data) {
    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
            },
        });
        return user;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('User creation failed');
    }
}

// Exporting the functions for use in other parts of the application
export { connectToDatabase, disconnectFromDatabase, createUser };