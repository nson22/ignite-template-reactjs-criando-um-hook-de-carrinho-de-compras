import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(
    () => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  }
  );

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const product = await api.get<Product>(`/products/${productId}`).then((response => response.data));
      const stock = await api.get<Stock>(`/stock/${productId}`).then((response => response.data));

      const existProduct = cart.find(product => product.id === productId);

      if(existProduct){
        if(stock.amount > existProduct.amount){
          const updatedProductInCart = cart.map(product => product.id === productId 
            ? {
              ...product,
              amount: product.amount++,
            } 
            : product);
            setCart(updatedProductInCart)
            localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedProductInCart));
          }else{
            toast.error("Quantidade solicitada fora de estoque")
          }
        }else{
          if(stock.amount > 0){
            setCart([...cart, {...product, amount: 1}])
            localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, {...product, amount: 1}]));
          }
      }
     
    } catch {
      // TODO
      toast.error("Erro na adição do produto")
     
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
        const existProduct = cart.find(product => product.id === productId);

        if(existProduct){

          const removedProduct = cart.filter(product => product.id !== productId)
          setCart(removedProduct);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify(removedProduct));
          
        }else{
          toast.error('Erro na remoção do produto');
        }
        
        
      } catch {
        // TODO
        toast.error('Erro na remoção do produto');
      }
    };
    
    const updateProductAmount = async ({
      productId,
      amount,
    }: UpdateProductAmount) => {
      try {
        // TODO
        const stock = await api.get<Stock>(`/stock/${productId}`).then((response => response.data));
        
        if(amount < 1){
          toast.error('Quantidade solicitada fora de estoque');
          return
        }

        if(stock.amount < amount){
          toast.error('Quantidade solicitada fora de estoque');
          return
        }
        
        const existProduct = cart.find(product => product.id === productId);
        
        if(existProduct){

         const updatedProductInCart = cart.map(product => product.id === productId 
            ? {
              ...product,
              amount,
            } 
            : product);

            setCart(updatedProductInCart)
            localStorage.setItem('@RocketShoes:cart', JSON.stringify(updatedProductInCart));

        }else{
          toast.error('Erro na alteração de quantidade do produto');
        }
        
        
      } catch {
        // TODO
        toast.error('Erro na alteração de quantidade do produto');
      }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}