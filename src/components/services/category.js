import axios from 'axios';
import { API_URL } from '../utils/constant';

export const categoryNamesFromAPI = () => {
    return axios.get(`${API_URL}/category_names`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log("error coursesCategories", error);
            throw error;
        });
};

export const getCategory = (categoryId) => {
    return axios.get(`${API_URL}/category/${categoryId}`)
        .then(response => {
            return response;
        })
        .catch(error => {
            console.log("error getCategory", error);
            throw error;
        });
};
