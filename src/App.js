import './App.css';
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [amount, setAmount] = useState("")


  const makePayment = async(event) => {
    event.preventDefault()
          let token
          let id
          await axios({
            method: 'post',
            url: 'http://localhost:5000/token',
            data: {
                    email: email
            },
        })
        .then((response) => {
            //console.log(response)
            token = response.data.token
            id = response.data.id
            console.log("tokendb",token)
        }).catch((error) => {
            console.log(error)
        })

        console.log('customerId',id)
      
            window.paysafe.checkout.setup("cHVibGljLTc3NTE6Qi1xYTItMC01ZjAzMWNiZS0wLTMwMmQwMjE1MDA4OTBlZjI2MjI5NjU2M2FjY2QxY2I0YWFiNzkwMzIzZDJmZDU3MGQzMDIxNDUxMGJjZGFjZGFhNGYwM2Y1OTQ3N2VlZjEzZjJhZjVhZDEzZTMwNDQ=", {
              "singleUseCustomerToken	": token,
              "customerId": id,
              "currency": "USD",
              "amount": parseInt(amount)*100,
              "locale": "en_US",
              "customer": {
                  "firstName": name,
                  "lastName": "Dee",
                  "email": email,
                  "phone": "1234567890",
                  "dateOfBirth": {
                      "day": 1,
                      "month": 7,
                      "year": 1990
                  }
              },
              "billingAddress": {
                  "nickName": "John Dee",
                  "street": "20735 Stevens Creek Blvd",
                  "street2": "Montessori",
                  "city": "Cupertino",
                  "zip": "95014",
                  "country": "US",
                  "state": "CA"
              },
              "environment": "TEST",
              "merchantRefNum": email,
              "canEditAmount": false,
              "payoutConfig":{
                  "maximumAmount": 100000
                  },
              "displayPaymentMethods":["card"],
              "paymentMethodDetails": {
                  "paysafecard": {
                      "consumerId": id
                  }
              }
          }, function(instance, error, result) {
              if (result && result.paymentHandleToken) {
                  console.log(result)
                  console.log(result.paymentHandleToken);
                  // make AJAX call to Payments API

                  result["merchantRefNum"] = email;
                  result["currency"] = "USD";
                  result["custId"] = id;
                  axios({
                    method: 'post',
                    url: 'http://localhost:5000/payment',
                    data: result
                    
                    // "token": result.paymentHandleToken,
                    // "amount": result.amount,
                })
                .then((result) => {
                  console.log(result)
                  if(result.data.data.status=='COMPLETED'){
                    instance.showSuccessScreen('Payment SUCCESSFULL')
                }
                else{
                     instance.showFailureScreen('Payment was declied .Try again with same or another payment method')
                }
                //setTimeout(window.location.replace('/'),5000);
            }).catch((error) => {
                    console.log(error)
                })
              } else {
                  console.error(error);
                  // Handle the error
              }
          }, function(stage, expired) {
              switch(stage) {
                  case "PAYMENT_HANDLE_NOT_CREATED": // Handle the scenario
                  case "PAYMENT_HANDLE_CREATED": // Handle the scenario
                  case "PAYMENT_HANDLE_REDIRECT": // Handle the scenario
                  case "PAYMENT_HANDLE_PAYABLE": // Handle the scenario
                  default: // Handle the scenario
              }
          });

  }


  return (
    <div className="App">
      <h3>ROIIM Assignment</h3>
      <div className="box">
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="UNIQUE USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label>Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="NAME"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="text"
            name="amount"
            placeholder="EMAIL ADDRESS"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="AMOUNT"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          ></input>
        </div>

        <div>

            <input type="submit" value="Pay" onClick={makePayment}></input>
        </div>

      </div>

    </div>
  );
}

export default App;
