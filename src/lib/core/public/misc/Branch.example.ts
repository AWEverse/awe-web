import branch from "./Branch";

const config = {
  "method": {
    "GET": {
      "path": {
        "/users": (req: any) => "Get users",
        "default": (req: any) => "Unknown path for GET"
      }
    },
    "default": (req: any) => "Unsupported method"
  }
};

const handler = branch(config);
console.log(handler({ method: "GET", path: "/users" })); // "Get users"
console.log(handler({ method: "GET", path: "/posts" })); // "Unknown path for GET"
console.log(handler({ method: "POST" })); // "Unsupported method"

// Example 1: Simple one-level branching
const simpleHandler = branch({
  'role': {
    'admin': () => 'Admin dashboard',
    'user': () => 'User homepage',
    'guest': () => 'Welcome page'
  }
});

// Usage
console.log(simpleHandler({ role: 'admin' })); // 'Admin dashboard'
console.log(simpleHandler({ role: 'user' })); // 'User homepage'
// console.log(simpleHandler({ role: 'moderator' })); // Error: No handler for key "role" with value "moderator"

// Example 2: Nested branching with multiple levels
const paymentHandler = branch({
  'paymentMethod': {
    'creditCard': branch({
      'cardType': {
        'visa': () => 'Processing Visa payment',
        'mastercard': () => 'Processing Mastercard payment',
        'amex': () => 'Processing American Express payment'
      }
    }),
    'paypal': () => 'Processing PayPal payment',
    'bankTransfer': branch({
      'region': {
        'eu': () => 'Processing EU bank transfer',
        'us': () => 'Processing US bank transfer',
        'asia': () => 'Processing Asia bank transfer'
      }
    })
  }
});

// Usage
console.log(paymentHandler({ paymentMethod: 'paypal' })); // 'Processing PayPal payment'
console.log(paymentHandler({ paymentMethod: 'creditCard', cardType: 'visa' })); // 'Processing Visa payment'
console.log(paymentHandler({ paymentMethod: 'bankTransfer', region: 'eu' })); // 'Processing EU bank transfer'

// Example 3: Deeper nesting with business logic
const orderProcessor = branch({
  'orderType': {
    'physical': branch({
      'shippingMethod': {
        'express': () => 'Processing express shipping order',
        'standard': branch({
          'location': {
            'domestic': () => 'Processing standard domestic shipping',
            'international': () => 'Processing standard international shipping'
          }
        })
      }
    }),
    'digital': branch({
      'fileType': {
        'pdf': () => 'Preparing PDF download link',
        'video': () => 'Setting up video streaming access',
        'software': branch({
          'platform': {
            'windows': () => 'Generating Windows download key',
            'mac': () => 'Generating Mac download key',
            'linux': () => 'Generating Linux download key'
          }
        })
      }
    })
  }
});

// Usage
console.log(orderProcessor({
  orderType: 'physical',
  shippingMethod: 'express'
})); // 'Processing express shipping order'

console.log(orderProcessor({
  orderType: 'physical',
  shippingMethod: 'standard',
  location: 'international'
})); // 'Processing standard international shipping'

console.log(orderProcessor({
  orderType: 'digital',
  fileType: 'software',
  platform: 'mac'
})); // 'Generating Mac download key'
