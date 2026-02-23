import React, { useState } from 'react';

const TakeInput = () => {
  const [foodText, setFoodText] = useState('');
  const [image, setImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleImageChange = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = () => {
    console.log("Food:", foodText);
    console.log("Quantity:", quantity);
    console.log("Image:", image);
  };

  return (
    <div className='w-full bg-white py-20 px-4'>
      <div className='max-w-[1000px] mx-auto text-center'>

        <h1 className='text-4xl font-bold mb-6 text-gray-800'>
          Analyze Your Food
        </h1>

        <p className='text-gray-500 mb-10'>
          Enter food details or upload an image to calculate calories and nutrients.
        </p>

        {/* INPUT SECTION */}
        <div className='bg-gray-100 p-8 rounded-xl shadow-md'>

          {/* TEXT INPUT */}
          <div className='mb-6 text-left'>
            <label className='block mb-2 font-semibold text-gray-700'>
              Enter Food Name
            </label>
            <input
              type='text'
              value={foodText}
              onChange={(e) => setFoodText(e.target.value)}
              placeholder='e.g. 2 chapati, rice, chicken breast'
              className='w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400'
            />
          </div>

          {/* IMAGE INPUT */}
          <div className='mb-6 text-left'>
            <label className='block mb-2 font-semibold text-gray-700'>
              Or Upload Food Image
            </label>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageChange}
              className='w-full'
            />

            {image && (
              <img
                src={image}
                alt='Preview'
                className='mt-4 w-40 rounded-lg shadow-md'
              />
            )}
          </div>

          {/* QUANTITY SELECTOR */}
          <div className='mb-6 text-left'>
            <label className='block mb-2 font-semibold text-gray-700'>
              Quantity
            </label>

            <div className='flex items-center gap-4'>
              <button
                onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                className='bg-gray-300 px-4 py-2 rounded-md'
              >
                -
              </button>

              <span className='text-lg font-semibold'>
                {quantity}
              </span>

              <button
                onClick={() => setQuantity(quantity + 1)}
                className='bg-gray-300 px-4 py-2 rounded-md'
              >
                +
              </button>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            onClick={handleSubmit}
            className='bg-green-500 text-white px-8 py-3 rounded-md font-semibold hover:bg-green-600 transition'
          >
            Calculate Nutrition
          </button>

        </div>

      </div>
    </div>
  );
};

export default TakeInput;