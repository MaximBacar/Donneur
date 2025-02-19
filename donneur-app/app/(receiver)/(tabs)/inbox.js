import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useAuth } from '../../../context/authContext';

const Inbox = () => {
  const { user, role, loading } = useAuth();

  const followedShelters = {
    shelters:[
         'FRdseCE570TWxDGBIj0C9DY54qn2', 
         'TmTdSxjyqCfMOKJlIXmh77ZtVqD2'
    ]
   }

  return (
    <View>
      <Text>inbox</Text>
    </View>
  )
}

export default Inbox

const styles = StyleSheet.create({})