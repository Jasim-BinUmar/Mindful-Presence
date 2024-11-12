import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import ContentCard from '../../../components/ContentCard'
import { images } from '../../../constants'
import GuideCard from '../../../components/GuideCard'
const FullGuide = () => {
    return (
        <SafeAreaView className='h-full'>

            <ScrollView className="flex-1 h-full">
                <View className="flex-1 h-full">
                    <View className="mt-6 -mb-3 mx-6">
                        <Text className='font-bold text-2xl text-center px-10'>Understanding The Power Of Affirmations, Visulizations And Meditation</Text>
                    </View>
                    <View className=' justify-center'>
                        <ContentCard
                            title='Affirmations from a Therapeutic & Islamic perspective'
                            image={images.fullGuide}
                        />
                    </View>
                    <View>
                        <GuideCard
                            title='Visualisations Therapeutically & Islamically'
                            buttonTitle='Preview'
                        />
                        <GuideCard
                            title='Visualisations Therapeutically & Islamically'
                            buttonTitle='Preview'
                        />
                        <GuideCard
                            title='Visualisations Therapeutically & Islamically'
                            buttonTitle='Preview'
                        />
                        
                    </View>


                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default FullGuide