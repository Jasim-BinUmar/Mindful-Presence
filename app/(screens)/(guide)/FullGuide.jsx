import { View, Text, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import ContentCard from '../../../components/ContentCard'
import { images } from '../../../constants'
import GuideCard from '../../../components/GuideCard'
import { router } from 'expo-router'


const FullGuide = () => {
    const handleSubmit = () => {
        console.log("Reached handle Submit")
        router.push('/(courseView)/CurriculumView')
    }
    return (
        <SafeAreaView className='h-full'>
            <StatusBar backgroundColor="#161622" style="light" />
            <ScrollView className="flex-1 h-full">
                <View className="flex-1 h-full">
                    <View className="mt-6 mb-3 ">
                        <Text className='font-bold text-2xl text-center'>Understanding The Power Of Affirmation, Visualisation And Meditation</Text>
                    </View>
                    <View className=' justify-center '>
                        <ContentCard
                            title='Affirmations from a Therapeutic & Islamic perspective'
                            image={images.fullGuide}
                        />
                    </View>
                    <View>
                        <GuideCard
                            title='Visualisations Therapeutically & Islamically'
                            buttonTitle='Preview'
                            handlePress={handleSubmit}
                        />
                        <GuideCard
                            title='Visualisations Therapeutically & Islamically'
                            buttonTitle='Preview'
                            handlePress={handleSubmit}
                        />
                        <GuideCard
                            title='Visualisations Therapeutically & Islamically'
                            buttonTitle='Preview'
                            handlePress={handleSubmit}
                        />
                        
                    </View>


                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default FullGuide