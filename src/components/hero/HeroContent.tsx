import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Star, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/img.png";

const HeroContent: React.FC = () => {
  const navigate = useNavigate();

  const handleExploreCafes = () => {
    navigate('/cafes');
  };


  return (
    <div className="text-center space-y-8">
      {/* Main Heading */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            MUJ Food Club
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Discover amazing food from your favorite campus cafes. Order and enjoy delicious meals delivered right to your block.
        </p>
      </div>

      {/* Hero Image */}
      <div className="relative max-w-4xl mx-auto">
        <img
          src={heroImage}
          alt="MUJ Food Club - Campus Food Delivery"
          className="w-full h-auto rounded-2xl shadow-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={handleExploreCafes}
          size="lg"
          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Utensils className="w-5 h-5 mr-2" />
          Explore Cafes
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Utensils className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-900">Fresh Food</h3>
          <p className="text-sm text-gray-600">Delicious meals from campus cafes</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Star className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-900">Quality Food</h3>
          <p className="text-sm text-gray-600">Fresh ingredients and authentic flavors</p>
        </div>
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="font-semibold text-gray-900">Block Delivery</h3>
          <p className="text-sm text-gray-600">Delivered right to your doorstep</p>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
