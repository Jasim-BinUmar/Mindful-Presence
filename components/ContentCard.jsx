import { View, Text, ImageBackground } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
// import { BlurView } from '@react-native-community/blur';
const ContentCard = ({ image, customStyles, title }) => {
    return (
        <View>
            <ImageBackground
                source={image}
                className="min-w-[250px] min-h-[250px] flex-grow mx-5 my-2 "
                imageStyle={{ borderRadius: 12 }}
            >
                <LinearGradient
                    colors={['#623AD9', '#1E1E2D', '#232533']}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: '100%',
                        opacity: 0.4,
                        borderRadius: 12

                    }} />
                <View className="rounded-b-xl absolute bottom-0 left-0 right-0 h-[35%] justify-start items-start">
                    {/* Background View for blur and opacity */}
                    <View className="bg-primary h-[100%] absolute bottom-0 left-0 right-0 opacity-55 rounded-b-xl" ></View>
                    {/* Text Content */}
                    <Text className="text-secondary-100 font-bold text-lg mx-5 my-2">{title}</Text>
                </View>




            </ImageBackground>

        </View>
    )
}

export default ContentCard