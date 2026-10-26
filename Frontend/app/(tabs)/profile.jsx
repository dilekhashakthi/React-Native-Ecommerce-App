import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import {useRouter} from 'expo-router'

const profile = () => {
  const router = useRouter()

  const handleLoginPress = () => router.push('/LoginScreen')
  const handleRegisterPress = () => router.push('/RegisterScreen')
  return (
    <View>
      <Text onPress={handleLoginPress} style={{margin: 50}}>Login</Text>
      <Text onPress={handleRegisterPress} style={{margin: 50}}>Register</Text>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({})