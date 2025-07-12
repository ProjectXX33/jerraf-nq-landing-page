
import React from 'react';

interface ProductPromoCardProps {
    title: string;
    description: string;
    imageUrl: string;
    purchaseUrl: string;
    altText: string;
}

const ProductPromoCard: React.FC<ProductPromoCardProps> = ({ title, description, imageUrl, purchaseUrl, altText }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-200 h-full flex flex-col justify-between animate-fade-in">
            <div>
                <h3 className="text-xl font-bold text-amber-600 mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{description}</p>
                <div className="flex justify-center my-4">
                    <img 
                        src={imageUrl} 
                        alt={altText} 
                        className="w-full max-w-[200px] h-auto object-contain rounded-lg shadow-md border p-1 bg-white transition-transform duration-300 hover:scale-105"
                    />
                </div>
            </div>
            <a 
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-6 text-center block bg-amber-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-4 focus:ring-amber-300 transition-all duration-300 ease-in-out"
            >
                الحصول على المنتج
            </a>
        </div>
    );
};

export default ProductPromoCard;
