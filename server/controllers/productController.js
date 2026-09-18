import Product from "../models/Product.js";
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// Add Product : /api/product/add
export const addProduct = async (req, res) => {
    try{
        let productData = req.body.productData;
        if(typeof productData === 'string'){
            productData = JSON.parse(productData);
        }

        const { name, description, category, price, offerPrice } = productData;
        const images = req.files;

        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let formData = new FormData();
                formData.append('file', fs.createReadStream(item.path));
                formData.append('upload_preset', 'grocery_preset'); // Apna unsigned preset naam yahan daalein (default 'ml_default' hota hai)

                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/hkj08s3a/image/upload`,
                    formData,
                    { 
                        headers: formData.getHeaders(),
                        timeout: 60000 
                    }
                );

                return response.data.secure_url;
            })
        );

        await Product.create({...productData, image: imagesUrl});

        res.json({success: true, message: "Product Added"});

    }catch(error){
        res.json({success: false, message: error.message});
    }
}

// Get Product : /api/product/list
export const productList = async (req, res) => {
    try{
        const products = await Product.find({});
        res.json({success: true, products})
    }catch(error){
        res.json({success: false, message: error.message});
    }
}

// Get single Product : /api/product/id
export const productById = async (req, res) => {
    try{
        const {id} = req.body;
        const product = await Product.findById(id);
        res.json({success: true, product});
    }catch(error){
        res.json({success: false, message: error.message});
    }
}

// Change Product inStock : /api/product/stock
export const changeStock = async (req, res) => {
    try{
        const {id, inStock} = req.body;
        await Product.findByIdAndUpdate(id, {inStock});
        res.json({success: true, message: "Stock Updated"});
    }catch(error){
        res.json({success: false, message: error.message});
    }
}