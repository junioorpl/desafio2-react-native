import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@goMarket:products');
      if (data) setProducts(JSON.parse(data));
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function storeProducts(): Promise<void> {
      await AsyncStorage.setItem(
        '@goMarket:products',
        JSON.stringify(products),
      );
    }
    storeProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(p => p.id === product.id);

      if (index < 0) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        setProducts(
          products.map(p => {
            if (p.id === products[index].id)
              return { ...p, quantity: p.quantity + 1 };

            return p;
          }),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);

      if (index > -1) {
        setProducts(
          products.map(p => {
            if (p.id === products[index].id)
              return { ...p, quantity: p.quantity + 1 };

            return p;
          }),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);

      if (products[index].quantity === 1) {
        const aux = products;
        setProducts(aux.splice(index, 1));
      }

      if (index > -1) {
        setProducts(
          products.map(p => {
            if (p.id === products[index].id && p.quantity > 0)
              return { ...p, quantity: p.quantity - 1 };

            return p;
          }),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
