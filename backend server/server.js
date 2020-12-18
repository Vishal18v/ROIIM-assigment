const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');

const app = express();

const User = require('./model/User');

dotenv.config();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(() => {
    console.log("Database connected .....")
})

const headers = {
    'Authorization': process.env.AUTH,
    'Simulator': 'EXTERNAL',
    'Content-Type': 'application/json'
};


async function createPaysafeId(email) {
    let paysafeId
    try {
        await axios({
            method: 'post',
            url: 'https://private-anon-da36cd760f-paysafeapipaymenthubv1.apiary-mock.com/paymenthub/v1/customers',
            data: {
                merchantCustomerId: email,
                locale: "en_US",
                firstName: "John",
                middleName: "James",
                lastName: "Smith",
                dateOfBirth: {
                    year: 1981,
                    month: 10,
                    day: 24
                },
                email: "john.smith@email.com",
                phone: "777-444-8888",
                ip: "192.0.126.111",
                gender: "M",
                nationality: "Canadian",
                cellPhone: "777-555-8888"
            },
            headers: headers
        })
        .then((response) => {
            //console.log(response.data)
            paysafeId = response.data.id
        }).catch((error) => {
            console.log(error)
        })

    } catch (error) {

    }
    return paysafeId
}

async function createToken(paysafeId){
    let token
    try{
        await axios({
            method: 'post',
            url: 'https://private-anon-da36cd760f-paysafeapipaymenthubv1.apiary-mock.com/paymenthub/v1/customers/' + paysafeId + '/singleusecustomertokens',
            data: {
                    merchantRefNum:"Ref123",
                    paymentTypes: ["CARD"],
            },
            headers: headers
        })
        .then((response) => {
            //console.log(response.data)
            token = response.data.singleUseCustomerToken
        }).catch((error) => {
            console.log(error)
        })


    } catch(error){

    }
    return token
}

app.use("/token", (req, res) => {
    User.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            console.log(err)
        } else {

            if (!user) {

                let paysafeId = await createPaysafeId(req.body.email)

                const newUser = {
                    paysafeId: paysafeId,
                    email: req.body.email
                }

                User.create(newUser, async(err, newUser) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("newuser", newUser)
                        let token = await createToken(newUser.paysafeId)
                        res.send({token: token})
                    }
                })

            } else {
                console.log("user hai")
                let token = await createToken(user.paysafeId)
                res.send({token: token})
                    
                
            }

        }
    })

})


async function payment(req) {
    let result = await  axios({
        method: 'post',
        url: 'https://private-anon-da36cd760f-paysafeapipaymenthubv1.apiary-mock.com/paymenthub/v1/payments',
        data: {
                "merchantRefNum":"Ref123",
                "amount": req.body,
                "currencyCode": "USD",
                "paymentHandleToken": req.token,
                "description": "Payment"
        },
        headers: headers
    })
    // .then((response) => {
    //     return response

    // }).catch((error) => {
    //     console.log(error)
    // })
    //console.log("logging",result)
    //console.log(result)
    return result
  }


app.use("/payment", async (req, res) => {
    console.log(req.body)
    let result = await payment(req.body)
    const data = result.data
    console.log(data)
    res.send({data:data})
    
});
   


app.listen(process.env.PORT || 5000, () => {
    console.log("Server is running.....");
});