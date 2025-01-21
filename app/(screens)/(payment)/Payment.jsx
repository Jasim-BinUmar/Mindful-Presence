import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import CustomButton from '../../../components/CustomButton';
//import { router } from 'expo-router';
import { useRouter } from 'expo-router';
import {getCurrentUser} from '../../../lib/appWrite'; 

const payment = () => {
  router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null); // Track selected plan
  const [uId, setUid] = useState(null);
  //Getting current user id
      useEffect(() => {
          const checkUserSession = async () => {
              try {
                  const currentUser = await getCurrentUser();
                  console.log("Current user's Id "+ currentUser.$id)
                  if (currentUser) {
                     setUid(currentUser.$id);
                     console.log("Current user's Id "+ currentUser.$id + " uId " + uId)
                  }
              } catch (error) {
                  console.log('No active session found', error);
              }
          };
  
          checkUserSession();
      }, []);
  


  // Function to handle card selection
  const handleSelectPlan = (index) => {
    setSelectedPlan(index);         
  };
  const paymentPlan = [
    { duration: '1 month', price: '119' },
    { duration: '3 months', price: '399' },
    { duration: '6 months', price: '699' },
    { duration: '1 year', price: '999' },
  ];

  // Function to go back to the previous screen
  const goBack = () => {
    router.replace('/(home)/Home');
  };

  // Function to submit response using fetch
  const submitResponse = async () => {
    
    if (selectedPlan !== null) {

      // console.log("user Id " + uId + " Duration " + paymentPlan[selectedPlan].duration);

      // router.push({
      //   pathname: '/paymentMethod',
      //   params: {
      //     duration: paymentPlan[selectedPlan].duration,
      //     price: paymentPlan[selectedPlan].price,
      //     userId: uId,
      //   },
      // });
      router.push('../paymentMethod');
    } else {
      alert('Please select a plan before proceeding.');
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-white px-8 py-4 items-center justify-center ">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity className="pr-2" onPress={goBack}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>

          <Text className="text-black text-2xl font-semibold ml-4">
            Pricing Plan
          </Text>
        </View>

        <View className="items-center justify-center ">
          {paymentPlan.map((plan, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSelectPlan(index)}
              className={` mb-4 rounded-lg ${selectedPlan === index ? 'border-2 border-primary' : 'border-gray-200'
                }`}
            // style={{
            //   borderWidth: 2,
            //   borderColor: selectedPlan === index ? '#6b46c1' : '#e5e7eb', // Tailwind's purple-500 and gray-200
            //   shadowColor: selectedPlan === index ? '#6b46c1' : '#000',
            //   shadowOpacity: 0.1,
            //   shadowOffset: { width: 0, height: 2 },
            //   shadowRadius: 5,
            // }}
            >
              <View
                key={index} // Added key for each mapped item
                className="flex items-center px-4 py-2 rounded-lg bg-white shadow-md  w-full"
              >
                {/* Duration Label */}
                <View className="bg-primary rounded-t-md px-3 ">
                  <Text className="text-white font-bold text-center">
                    {plan.duration}
                  </Text>
                </View>

                {/* Price */}
                <Text className="text-primary text-4xl font-bold mt-4">
                  ${plan.price}
                </Text>

                {/* Description */}
                <Text className="text-gray-500 text-center mt-2">
                  Including All Premium Features For Whole {plan.duration}
                </Text>
              </View>
            </TouchableOpacity>

          ))}

        </View>
        <View className="w-full mb-10 ">
          <CustomButton
            title="Subscribe"
            handlePress={() => {
              // handleSelect('Male');
              submitResponse();
            }}
            containerStyles="bg-primary py-4 mb-4 border-2 border-primary"
            textStyles="text-lg font-bold text-white"
          />
        </View>

      </View>
    </SafeAreaView>
  );
};

export default payment;
