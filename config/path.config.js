import path from 'path';

const __dirname = path.resolve();

export default {
    publicPath: path.join(__dirname, 'public'),
    productsFilePath: path.join(__dirname, 'data', 'products.json')
};
