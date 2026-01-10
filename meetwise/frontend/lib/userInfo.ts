import { auth } from './api';

export const getUserInfo = async () => {
    return auth.getUser();
};
