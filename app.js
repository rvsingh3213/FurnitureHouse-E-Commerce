const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "68qj1igvby1s",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "sjEQ7XUpLpgUfPOKPFtsQg2KeJMMSuKWU3jKwO3Jh3s",
});

//console.log(client);

//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");

//for number on cart
const cartItems = document.querySelector(".cart-items");

//for cart total amount
const cartTotal = document.querySelector(".cart-total");

const cartContent = document.querySelector(".cart-content");
//will deal with products displaying
const productsDOM = document.querySelector(".products-center");

//for add cart button
//const btns = document.querySelectorAll(".bag-btn");  at this moment no product loaded so console will give Empty node list
//console.log(btns);

//cart items
let cart = [];

//buttons
let buttonsDOM = [];

// responsible for geting products first from JSON later from contentfull
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "woodenHouseProducts",
      });
      /*.then((response) => console.log(response.items))
        .catch(console.error);*/

      //  console.log(contentful);

      //let result = await fetch("products.json");
      //let data = await result.json();

      // later on will change above two lines and get data from contentfull
      let products = contentful.items;
      //let products = data.items;

      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }

    //we will use await -- we will be waiting untill products return
    // to use await we need to put async on funciton
  }
  // getProducts() end
}

//display products coming from products class
class UI {
  displayProduct(products) {
    //console.log(products);

    let result = ""; //will add to it as string

    products.forEach((product) => {
      //on each product we will add product values dynamically
      //back tick template literal
      //template for displaying single product is getting used n no. times
      result += `
      <!--Single Product-->
      <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt="product"
              class="product-img"
            />
            
            <button class="bag-btn" data-id=${product.id}
            >
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>

          <h3>${product.title}</h3>
          <h4>$${product.price}</h4>
        </article>

        <!--End Single product-->
      `;
    }); //end  of Loop

    productsDOM.innerHTML = result;
  } //displayProduct() ends

  getBagButtons() {
    // we putting into array cause then we need to use find() function
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    // we wanted in array not in nodeList
    //Array.from(document.querySelectorAll(".bag-btn"));
    //console.log(buttons);

    buttons.forEach((button) => {
      let id = button.dataset.id;
      //console.log(id);
      // this is to check weather that item is in cart or not
      let inCart = cart.find((item) => item.id == id);

      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      // adding click listener to button
      button.addEventListener("click", (event) => {
        // console.log(event);

        event.target.innerText = "In Cart";
        event.target.disabled = true;

        //now will get products from storage
        //add product into cart
        // save cart in local storage
        //set cart values
        // display item into cart
        //show cart

        //now will get products from storage
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        // console.log(cartItem);

        //add product into cart
        cart = [...cart, cartItem];
        //console.log(cart);

        // also save cart in local storage
        Storage.saveCart(cart);

        //set cart values
        //can getCart inside setCartValues() but lets pass  cart
        this.setCartValues(cart);

        // display item into cart
        this.addCartItem(cartItem);

        //show cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let totalAmount = 0;
    let totalQuantity = 0;
    // if dont want to pass cart can fetch from localStorage
    //let cart = JSON.parse(localStorage.getItem("cart"));

    cart.forEach((product) => {
      totalAmount += product.price * product.amount;
      totalQuantity += product.amount;
    });
    //now put values into cart
    cartItems.innerText = totalQuantity;
    cartTotal.innerText = parseFloat(totalAmount.toFixed(2));
    //console.log(cartItems, cartTotal, totalQuantity, totalAmount);
  }

  // another method to add Items to cart this function will run when adding items to cart and when page reloads to help in populating cart
  addCartItem(item) {
    let div = document.createElement("div");
    //giving class cart-item to this div
    div.classList.add("cart-item");
    //now we will give it Template literal from our cart item created
    //we could have done like loading products but this is another way we can create element like we have done in
    //displayProducts() function
    div.innerHTML = `<img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;

    //so to control functionality of remove and up down and item amount
    // we need to give them id so data-id=${item.id}

    cartContent.appendChild(div);
    // console.log(cartContent);
  }
  //to show cart
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  //when page loaded will check
  setUpAPP() {
    //this will check storage and get us all cart Values form storage class
    cart = Storage.getCart();

    //now we have got cart items so we need to show countAmount of items
    this.setCartValues(cart);

    //now we have to populate cart with cart items
    this.populateCart(cart);

    //now we need to add event listener to cartButton and
    //another way
    cartBtn.addEventListener("click", this.showCart);
    //we are using it because we dont want to access any methods of class in
    // this.showCart() else reference of button will be passed

    /*cartBtn.addEventListener("click", () => {
      this.showCart();

      //should use this way if want to access methods of this class here
    });*/

    //close cart
    closeCartBtn.addEventListener("click", this.closeCart);
  }

  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  closeCart() {
    // console.log("close cart clicked");
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    //to clear all items
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //we cannot use below cause this will not reference to this class
    // so we are using above way
    //clearCartBtn.addEventListener("click", this.clearCart);

    //now adding remove and up down functionality can do this
    // in 1 more way by adding onclicklistener during adding cart
    // so must try that way also

    cartContent.addEventListener("click", (event) => {
      //  console.log(event.target); //this will tell us which element got click
      // we are using event bubbling

      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        // console.log(removeItem);
        let id = removeItem.dataset.id;
        this.removeItem(id);
        // we will have to remove the item from CartDOM

        //console.log(removeItem.parentElement.parentElement);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        // as "remove" is under div->div so we will get parentElement of
        //remove check in HTML code where we have mentioned
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id == id);
        tempItem.amount = tempItem.amount + 1; // so it will update cart also

        Storage.saveCart(cart);
        this.setCartValues(cart); // will update total on cart icon
        //now we will DOM traverse and we have element addAmount that is
        // chevron up we need to use element Next to it so
        addAmount.nextElementSibling.innerText = tempItem.amount;

        //1. so when updating amount we need to update it into locatStorage too
        // 2. update totalPriceAmount
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id == id);

        tempItem.amount = tempItem.amount - 1;

        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerHTML = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    //console.log(this);

    let cartItems = cart.map((item) => item.id);
    // console.log(item);
    //passing if cause we got id's on above line into array
    cartItems.forEach((id) => this.removeItem(id));
    console.log(cartContent.children);
    //for DOM elements we have property of children
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    //after that hide cart
    this.closeCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id != id);
    this.setCartValues(cart);
    Storage.saveCart(cart);

    //now we also need to access the buttons once item is remove
    //add to cart button should work

    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id == id);

    //as we have access to all buttons so after we will check on each button
    //if id== button id then it will return that button
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    // we are storing products as String
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProducts(id) {
    // now parsing string to JSON
    // so now we are getting array into products
    let products = JSON.parse(localStorage.getItem("products"));

    //return product
    return products.find((product) => product.id == id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];

    //if cart has any values return else return empty array
  }
}

// now will add event listener
document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  //when page reloaded will check retain items into cart
  ui.setUpAPP();
  //get al products
  products
    .getProducts()
    .then((products) => {
      ui.displayProduct(products);
      Storage.saveProducts(products);
      // console.log(products);
    })
    .then(() => {
      //after loading products will get bag buttons and will get their id's
      ui.getBagButtons();

      //will do cartLogic for remove item increase quantity and all
      ui.cartLogic();
    });
});
