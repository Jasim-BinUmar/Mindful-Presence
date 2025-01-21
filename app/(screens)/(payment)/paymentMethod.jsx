// // import { View, Text } from 'react-native'
// // import React, { useState } from 'react'
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { ChevronLeft } from 'lucide-react-native';
// // import CreditCard from '../../../components/CreditCard';
// // import { TouchableOpacity } from 'react-native';
// // import { router } from 'expo-router';
// // import CustomButton from '../../../components/CustomButton';

// // export default function paymentMethod() {
// //     // State to keep track of the selected credit method
// //     const [paymentMethod, setPaymentMethod] = useState(null);

// //     // Function to handle selection
// //     const handleSelect = (payment) => {
// //         setPaymentMethod(payment);
// //     };

// //     const submitResponse = (paymentMethod) => {
// //         router.push('/cardDetails')
// //     }
    
// //     // Function to go back to the previous screen
// //     const goBack = () => {
// //         router.push('/(payment)/Payment');
// //     };

// //     return (
// //         <SafeAreaView style={{ flex: 1 }}>
// //             <View className="flex-1 bg-white px-8 py-4 items-center  ">
// //                 <View className="flex-row items-center mb-6">
// //                     <TouchableOpacity className="pr-2" onPress={goBack}>
// //                         <ChevronLeft size={24} color="#000" />
// //                     </TouchableOpacity>

// //                     <Text className="text-black text-2xl font-semibold ml-4">
// //                         Pricing Plan
// //                     </Text>
// //                 </View>

// //                 <View>
// //                     <CreditCard cardHolder="KELLY OLIVER" lastFour="8014" expiry="08/21" />
// //                 </View>

// //                 <View className="w-full py-4">
// //                     <CustomButton title="Paypal"
// //                         handlePress={() => {
// //                             handleSelect('Paypal');
// //                             submitResponse();
// //                         }}
// //                         containerStyles="bg-white py-4 mb-4 border border-gray"
// //                         textStyles="text-lg font-bold text-black"
// //                     />
// //                     <CustomButton title="Credit Card"
// //                         handlePress={() => {
// //                             handleSelect('Credit Card');
// //                             submitResponse();
// //                         }}
// //                         containerStyles="bg-white py-4 mb-4 border border-gray"
// //                         textStyles="text-lg font-bold  text-black"
// //                     />
// //                     <CustomButton title="Apple Pay"
// //                         handlePress={() => {
// //                             handleSelect('Apple Pay');
// //                             submitResponse();
// //                         }}
// //                         containerStyles="bg-white py-4 mb-4 border border-gray"
// //                         textStyles="text-lg font-bold text-black"
// //                     />
// //                 </View>

// //             </View>

// //         </SafeAreaView>

// //     )
// // }


// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
// //import { useSearchParams } from 'expo-router'; // Assuming Expo Router is used
// import { useLocalSearchParams } from 'expo-router';

// import { CardField, useStripe } from '@stripe/stripe-react-native';

// const PaymentMethod = () => {

//     console.log("At payment method screen") 
//   //const { duration, price, userId } = useSearchParams(); // Plan and user details passed via navigation
//   const { duration, price, userId } = useLocalSearchParams();
//   console.log("Duration" + duration + "Price" + price + "User Id" + userId)
//   const { confirmPayment } = useStripe(); // Hook for payment confirmation
//   const [cardDetails, setCardDetails] = useState(null); // Card input state
//   const [loading, setLoading] = useState(false);
//   const [paymentIntentId, setPaymentIntentId] = useState(null); // Store paymentIntent ID

//   const createPaymentIntent = async () => {
//     try {
//       setLoading(true);

//       // Call your backend API to create a payment intent
//       const response = await fetch('http://192.168.0.105:5000/api/payments/create-payment-intent', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, amount: price }),
//       });

//       const { clientSecret, paymentIntentId } = await response.json();

//       if (!clientSecret) {
//         Alert.alert('Error', 'Failed to create payment intent.');
//         return null;
//       }

//       setPaymentIntentId(paymentIntentId);
//       return clientSecret;
//     } catch (error) {
//       console.error('Error creating payment intent:', error);
//       Alert.alert('Error', 'Could not initiate payment. Please try again.');
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayment = async () => {
//     if (!cardDetails?.complete) {
//       Alert.alert('Incomplete Details', 'Please fill in all card details.');
//       return;
//     }

//     try {
//       setLoading(true);

//       // Step 1: Create a payment intent if not already created
//       const clientSecret = paymentIntentId ? null : await createPaymentIntent();
//       if (!clientSecret && !paymentIntentId) return;

//       // Step 2: Confirm payment with Stripe
//       const { error, paymentIntent } = await confirmPayment(clientSecret || paymentIntentId, {
//         type: 'Card',
//         billingDetails: {
//           email: 'jasimbinumar@gmail.com', // Replace with actual user email
//         },
//       });

//       if (error) {
//         console.error('Payment Error:', error.message);
//         Alert.alert('Payment Failed', error.message);
//         return;
//       }

//       // Step 3: Confirm payment on the backend
//       const confirmResponse = await fetch('http://192.168.0.105:5000/api/payments/confirm-payment', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           paymentIntentId: paymentIntent.id,
//           paymentMethodId: cardDetails?.id, // Card details ID if required
//         }),
//       });

//       const result = await confirmResponse.json();

//       if (result.message === 'Payment successful') {
//         Alert.alert('Success', 'Payment completed successfully!');
//       } else {
//         Alert.alert('Payment Error', result.message || 'Unknown error occurred.');
//       }
//     } catch (error) {
//       console.error('Error confirming payment:', error.message);
//       Alert.alert('Error', 'Payment process failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
//       <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>
//         Plan: {duration}
//       </Text>
//       <Text style={{ fontSize: 16, marginBottom: 40 }}>Price: ${price}</Text>

//       <CardField
//         postalCodeEnabled={true}
//         placeholder={{ number: '4242 4242 4242 4242' }}
//         cardStyle={{
//           backgroundColor: '#FFFFFF',
//           textColor: '#000000',
//         }}
//         style={{
//           width: '100%',
//           height: 50,
//           marginVertical: 30,
//         }}
//         onCardChange={(details) => setCardDetails(details)}
//       />

//       <TouchableOpacity
//         style={{
//           backgroundColor: '#6b46c1',
//           padding: 15,
//           borderRadius: 8,
//           width: '100%',
//           alignItems: 'center',
//         }}
//         onPress={handlePayment}
//         disabled={loading}
//       >
//         {loading ? (
//           <ActivityIndicator color="#fff" />
//         ) : (
//           <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
//             Confirm Payment
//           </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default PaymentMethod;



import { View, Text } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import CreditCard from '../../../components/CreditCard';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import CustomButton from '../../../components/CustomButton';

export default function paymentMethod() {
    // State to keep track of the selected credit method
    const [paymentMethod, setPaymentMethod] = useState(null);

    // Function to handle selection
    const handleSelect = (payment) => {
        setPaymentMethod(payment);
    };

    const submitResponse = (paymentMethod) => {
        router.push('/cardDetails')
    }
    
    // Function to go back to the previous screen
    const goBack = () => {
        router.push('/(payment)/Payment');
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-1 bg-white px-8 py-4 items-center  ">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity className="pr-2" onPress={goBack}>
                        <ChevronLeft size={24} color="#000" />
                    </TouchableOpacity>

                    <Text className="text-black text-2xl font-semibold ml-4">
                        Pricing Plan
                    </Text>
                </View>

                <View>
                    <CreditCard cardHolder="KELLY OLIVER" lastFour="8014" expiry="08/21" />
                </View>

                <View className="w-full py-4">
                    <CustomButton title="Paypal"
                        handlePress={() => {
                            handleSelect('Paypal');
                            submitResponse();
                        }}
                        containerStyles="bg-white py-4 mb-4 border border-gray"
                        textStyles="text-lg font-bold text-black"
                    />
                    <CustomButton title="Credit Card"
                        handlePress={() => {
                            handleSelect('Credit Card');
                            submitResponse();
                        }}
                        containerStyles="bg-white py-4 mb-4 border border-gray"
                        textStyles="text-lg font-bold  text-black"
                    />
                    <CustomButton title="Apple Pay"
                        handlePress={() => {
                            handleSelect('Apple Pay');
                            submitResponse();
                        }}
                        containerStyles="bg-white py-4 mb-4 border border-gray"
                        textStyles="text-lg font-bold text-black"
                    />
                </View>

            </View>

        </SafeAreaView>

    )
}