import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import GeneralContext from '../../contexts/GeneralContext';
import { useParams } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import 'react-responsive-carousel/lib/styles/carousel.min.css';
import "./SingleProduct.scss";
import Sizes from './Sizes';
import Colors from './Colors';
import RecommendedProducts from '../Products/RecommendedProducts';

const SingleProduct = () => {
  const [singleProduct, setSingleProduct] = useState([]);
  const { products, setCart, cart } = useContext(GeneralContext);
  const [id, setId] = useState(Number(useParams().id));
  const [productDescription, setProductDescription] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");

  console.log(cart);
  const getProductById = (id) => {
    axios.get(`http://localhost:5001/api/products/${id}`)
      .then(res => {
        setSingleProduct(prev => res.data.product);
      });
  };

  useEffect(() => {
    if (singleProduct.sku) {
      const productVariation = singleProduct.sku.slice(0, 4);
      const allColors = products.filter(product =>
        product.sku.slice(0, 4) === productVariation)
        .map(row => {
          return (row.id === singleProduct.id) ? { ...row, selected: true } : { ...row, selected: false };
        });
      setAllColors(allColors);
    }

    if (singleProduct.description) {
      const description = singleProduct.description
        .split("\n")
        .map((line, index) => {
          return <li key={index}>{line}</li>;
        });
      setProductDescription(description);
    }

    window.scrollTo(0, 0);

    // Make selected color persist on refresh
    window.history.replaceState('', '', `/products/${(singleProduct.category)}/${id}`);

  }, [products, singleProduct, id]);

  useEffect(() => {
    getProductById(id);
  }, [id]);

  const changeColor = (product) => {
    setId(product.id);
    getProductById(product.id);
  };

  const onSelectSize = (data) => {
    setSelectedSize(data);
  };

  const addToCart = () => {

    const newCartItem = {
      sku: singleProduct.sku,
      name: singleProduct.name,
      price: singleProduct.price / 100,
      color: singleProduct.color,
      image: singleProduct.image1,
      quantity: 1,

      size: selectedSize,

    };

    const itemInCart = cart.find((item) => {
      return item.sku === newCartItem.sku &&
        item.size === newCartItem.size &&
        item.color === newCartItem.color;
    });

    if (newCartItem.size === "") {
      <div>Pick size</div>;
    }
    else if (itemInCart) {
      itemInCart.quantity += 1;
      setCart([...cart]);
      toast("Item Added To Cart", { type: 'success', autoClose: 1000, theme: 'light' });
    } else if (!itemInCart) {
      setCart([...cart, newCartItem]);
      toast("Item Added To Cart", { type: 'success', autoClose: 1000, theme: 'light' });
    }
    // console.log(newCartItem);
  };

  // console.log(selectedSize);
  // console.log(singleProduct);
  return (
    <div>
      <div className='main-single-product'>

        <Carousel
          showArrows={false}
          showStatus={false}
          showThumbs={true}
          autoPlay={false}
          infiniteLoop={false}
          interval={5000}>
          <div>
            <img className='slider-images' src={`/images${singleProduct.image1}`} alt="Slide 1" />
          </div>
          <div>
            <img className='slider-images' src={`/images${singleProduct.image2}`} alt="Slide 2" />
          </div>
          <div>
            <img className='slider-images' src={`/images${singleProduct.image3}`} alt="Slide 3" />
          </div>
        </Carousel>

        <div className='product-details'>

          <div className='name-price'>
            <div className='name'>{singleProduct.name}</div>
            <div className='price'>${(singleProduct.price / 100).toFixed(2)}</div>
          </div>

          <div className='style-cat'>{singleProduct.style}</div>
          <div className='sku'>SKU: {singleProduct.sku}</div>
          <div>
            <div className='size-color'>Color : {singleProduct.color}</div>
            <Colors onColor={changeColor} allColors={allColors} />
            <div className='size-color'>Size</div>
            <Sizes onSelectSize={onSelectSize} selectedSize={selectedSize} setSelectedSize={setSelectedSize} />

            <div>
              <ul>
                <div className='product-desc'>Description</div>
                {productDescription}
              </ul>
            </div>

            <div className='add-to-cart'>
              <div className={selectedSize !== "" ? "dont-show-disabled" : "show-disabled"}>Please Select Size!</div>
              <button
                disabled={selectedSize === ""}
                onClick={addToCart}
                className='cart-button'>
                Add To Cart
              </button>
              <ToastContainer />
            </div>

          </div>
        </div>

      </div>
      {products.length > 0 ? (
        <RecommendedProducts singleProduct={singleProduct} setSingleProduct={setSingleProduct} category={singleProduct.category} />
      ) : (
        <div>Loading recommended products...</div>
      )}

    </div>
  );
};

export default SingleProduct;