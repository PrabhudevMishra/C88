import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerItems } from "react-navigation-drawer";
import firebase from "firebase";
import { Avatar } from "react-native-elements";
import db from "../config";
import * as ImaagePicker from "expo-image-picker";

export default class CustomSidebarMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      userId: firebase.auth().currentUser.email,
      image: "#",
      name: "",
      docId: "",
    };
  }

  selectPicture = async () => {
    const { cancelled, uri } = await ImaagePicker.launchImageLibraryAsync({
      mediaTypes: ImaagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!cancelled) {
      this.setState({
        image: uri,
      });

      this.uploadImage(uri, this.state.userId);
    }
  };

  uploadImage = async (uri, imageName) => {
    var response = await fetch(uri);
    var blob = await response.blob();

    var ref = firebase
      .storage()
      .ref()
      .child("user_profiles/" + imageName);

    return ref.put(blob).then((response) => {
      this.fetchImage(imageName);
    });
  };

  fetchImage = (imageName) => {
    var storageRef = firebase
      .storage()
      .ref()
      .child("user_profiles/" + imageName);

    storageRef
      .getDownloadURL()
      .then((url) => {
        this.setState({
          image: url,
        });
      })
      .catch((error) => {
        this.setState({
          image: "#",
        });
      });
  };

  getUserProfile = () => {
    db.collection("users")
      .where("username", "==", this.state.userId)
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          this.setState({
            name: doc.data().first_name + " " + doc.data().last_name,
          });
        });
      });
  };

  componentDidMount() {
    this.fetchImage(this.state.userId);
    this.getUserProfile();
  }

  render() {
    return (
      <View style={styles.container}>
        <View
          style={{ flex: 0.5, alignItems: "center", backgroundColor: "orange" }}
        >
          <Avatar
            rounded
            source={{
              uri: this.state.image,
            }}
            size="medium"
            onPress={() => {
              this.selectPicture();
            }}
            //containerStyle={styles.imageContainer}
            showEditButton
          />

          <Text style={{ fontWeight: "100", fontSize: 20, paddingTop: 10 }}>
            {this.state.name}
          </Text>
        </View>
        <View style={styles.drawerItemContainer}>
          <DrawerItems {...this.props} />
        </View>
        <View style={styles.logOutContainer}>
          <TouchableOpacity
            style={styles.logOutButton}
            onPress={() => {
              this.props.navigation.navigate("WelcomeScreen");
              firebase.auth().signOut();
            }}
          >
            <Text style={styles.logOutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerItemContainer: {
    flex: 0.8,
  },
  logOutContainer: {
    flex: 2.2,
    justifyContent: "flex-end",
    paddingBottom: 30,
  },
  logOutButton: {
    justifyContent: "center",
    width: "100%",
    height: 60,
    padding: 10,
  },
  logOutText: {
    fontSize: 30,
    fontWeight: "bold",
  },
  imageContainer: {
    flex: 0.75,
    width: "40%",
    height: "20%",
    marginTop: 30,
    marginLeft: 20,
    borderRadius: 40,
  },
});
