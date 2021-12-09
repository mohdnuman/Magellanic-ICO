import React, { Component } from "react";
import MagellanictokenSale from "./contracts/MagellanictokenSale.json";
import Magellanictoken from "./contracts/MagellanicToken.json";
import getWeb3 from "./getWeb3";
import {
  Button,
  Container,
  Form,
  Grid,
  Header,
  Icon,
  Input,
  Message,
  Progress,
} from "semantic-ui-react";

import "./App.css";

class App extends Component {
  state = {
    price: '0',
    web3: null,
    accounts: null,
    contract: null,
    balance: 0,
    tokenSold: 0,
    value: '0',
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the tokenSale contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MagellanictokenSale.networks[networkId];
      const instance = new web3.eth.Contract(
        MagellanictokenSale.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Get the token contract instance.
      // const networkId = await web3.eth.net.getId();
      const deployedNetwork2 = Magellanictoken.networks[networkId];
      const tokenInstance = new web3.eth.Contract(
        Magellanictoken.abi,
        deployedNetwork2 && deployedNetwork2.address
      );

      const tokensPrice = await instance.methods.tokenPrice().call();
      const tokenSold = await instance.methods.tokenSold().call();

      const balanceUser = await tokenInstance.methods
        .balanceOf(accounts[0])
        .call();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3,
        accounts,
        contract: instance,
        price: web3.utils.fromWei(tokensPrice, "ether"),
        balance: balanceUser,
        tokenSold,
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  handleChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  };

  handleBuy = async () => {
    const web3=this.state.web3;
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = MagellanictokenSale.networks[networkId];
    const instance = new web3.eth.Contract(
      MagellanictokenSale.abi,
      deployedNetwork && deployedNetwork.address
    );

    const value = this.state.value;
    let send=parseFloat(this.state.value) * parseFloat(this.state.price);
    send=send.toString();
    send=web3.utils.toWei(send, 'ether');
    const receipt = await instance.methods
      .buyTokens(value)
      .send({
        from: this.state.accounts[0],
        value: send,
      });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <link
          async
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/semantic-ui@2/dist/semantic.min.css"
        />
        <Container>
          <Header as="h1" block color="black" style={{ marginTop: 20 }}>
            Magellanic Coin ICO
          </Header>
          <Header size="medium">
            Introducing Magellanic(MGL) Token! Token Price is {this.state.price}{" "}
            ether. You Currently have {this.state.balance} tokens.
          </Header>
          <br />
          <br />

          <Form style={{ marginLeft: 280 }}>
            <Grid columns={10}>
              <Grid.Column width={9}>
                <Form.Field>
                  <Input
                    type="number"
                    placeholder="Enter The Number Of Tokens To Buy"
                    value={this.state.value}
                    onChange={this.handleChange}
                  />
                </Form.Field>
              </Grid.Column>
              <Grid.Column width={1}>
                <Button primary color="blue" onClick={this.handleBuy}>
                  Buy!
                </Button>
              </Grid.Column>
            </Grid>
          </Form>
          <Progress
            percent={(this.state.tokenSold / 750000) * 100}
            indicating
          />
          <span>{this.state.tokenSold}/750000 tokens sold</span>
          <Message info>
            <Icon name="info" />
            NOTICE: This token sales uses rinkeby test network with fake ether.
            Use a browser extension like metamask to connect to the test network
            and participate in the ICO. Please be patient if the test network
            runs slowly.
          </Message>
          <hr />
          <span>Your Account:{this.state.accounts[0]}</span>
        </Container>
      </div>
    );
  }
}

export default App;
