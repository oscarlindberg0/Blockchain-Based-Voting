import React, { useEffect, useState } from "react";
import Web3 from "web3";
import ElectionContract from "../abis/Election.json";
import { Container, TextField, Button, Typography, List, ListItem, ListItemText, Stack } from "@mui/material";

const ElectionApp = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const webSocketProvider = new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);

        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log("MetaMask Accounts:", await window.ethereum.request({ method: "eth_accounts" }));

        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = ElectionContract.networks[networkId];

        if (!deployedNetwork) {
            console.error("Contract not deployed to detected network");
            return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          ElectionContract.abi,
          deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setContract(contractInstance);
        loadCandidates(contractInstance);
      }
    };
    initWeb3();

    if(contract){
        contract.events.CandidateRegistered({}, async (error, event) => {
            if (!error){
                console.log("New candidate registered", event.returnValues);
                await loadCandidates(contract);
            } else {
                console.error("Event error: ", error);
            }
        });

        contract.events.Voted({}, async (error, event) => {
            if (!error){
                console.log("Vote registereed", event.returnValues);
                await loadCandidates(contract);
            } else {
                console.error("Event error: ", error);
            }
        });
    }

  }, []);

  // socket connection to listen for events from smart contract
  useEffect(() => {
    if (contract) {

      const web3Socket = new Web3(webSocketProvider);
  
      const socketContract = new web3Socket.eth.Contract(
        ElectionContract.abi,
        contract.options.address
      );
  
      socketContract.events.CandidateRegistered({}, async (error, event) => {
        if (!error) {
          console.log("New candidate registered", event.returnValues);
          await loadCandidates(contract);
        } else {
          console.error("Event error:", error);
        }
      });
      socketContract.events.Voted({}, async (error, event) => {
        if(!error){
            console.log("Voted", event.returnValues);
            await loadCandidates(contract);
        } else {
            console.error("Event error:", error);
        }
      });
    }
  }, [contract]);

  // close socket connection
  useEffect(() => {
    const web3Socket = new Web3(webSocketProvider);
  
    return () => {
      web3Socket.currentProvider.disconnect();
    };
  }, []);

  const loadCandidates = async (contractInstance) => {

    try {
        const candidatesCount = await contractInstance.methods.candidatesCount().call();
        const candidatesArray = [];
        if (candidatesCount === 0)
            return;
        for (let i = 1; i <= candidatesCount; i++) {
            const candidate = await contractInstance.methods.candidates(i).call();
            candidatesArray.push({id: candidate.id, votes: candidate.voteCount, name: candidate.name, party: candidate.party});
        }
        setCandidates([...candidatesArray]);
        console.log("loaded candidates");
    } catch (error) {
        console.error("Could not load candidates: ", error);
    }
  };

  const registerCandidate = async () => {
    if (!contract) {
        console.error("Smart contract is not initialized. Try refreshing the page.");
        return;
    }
    if (name && party) {
        try {
            console.log("Registering candidate:", name, party);
            await contract.methods.registerCandidate(name, party)
            .send({ from: account, gas: 3000000 }); // high gas limit for testing purposes
            setName("");
            setParty("");
            console.log("Candidate " + name + " of the " + party + " party registered")
        } catch (error) {
            console.error("Transaction failed: ", error);
        }
    } 
  };

  const checkElectionStatus = async () => {
    if (contract) {
      const status = await contract.methods.electionStarted().call();
      console.log("Election Started:", status);
      return status;
    }
  };  

  const voteForCandidate = async (id) => {
    if (!contract)
        return;

    try{
        await contract.methods.vote(id)
            .send({ from: account, gas: 3000000 })
            .on('transactionHash', function(hash){
                console.log("Transaction Hash:", hash); // ✅ Debugging Line
            })
            .on('receipt', function(receipt){
                console.log("Transaction Receipt:", receipt); // ✅ Debugging Line
            })
            .on('confirmation', function(confirmationNumber, receipt){
                console.log("Transaction Confirmed:", confirmationNumber); // ✅ Debugging Line
            })
            .on('error', function(error){
                console.error("Transaction Error:", error); // ✅ Debugging Line
            });
        console.log("Voted for:", id);

        // refresh candidate list
        await loadCandidates(contract);
    } catch (error) {
        console.error("Voting failed: ", error);
    }
  };

  const toggleElection = async () => {
    if (!contract) {
        console.error("Smart contract is not initialized.");
        return;
    }
    try {
        const electionStatus = await contract.methods.electionStarted().call();
        if (electionStatus) {
          await contract.methods.endElection().send({ from: account, gas: 3000000 });
          console.log("Election ended");
        } else {
          await contract.methods.startElection().send({ from: account, gas: 3000000 });
          console.log("Election started");
        }
      } 
      catch (error) {
        console.error("Transaction failed: ", error);
        }
    }

    const clearCandidates = async () => {
        await contract.methods.clearCandidates().send({ from: account, gas: 3000000 });
        loadCandidates(contract);
        console.log("Cleared candidates");
    }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Election DApp - Owner</Typography>
      <TextField label="Candidate Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />
      <TextField label="Party" value={party} onChange={(e) => setParty(e.target.value)} fullWidth margin="normal" />
      <Stack direction="row" spacing={10} justifyContent="center">
        <Button variant="contained" color="primary" onClick={registerCandidate}>Register Candidate</Button>
        <Button variant="contained" color="primary" onClick={toggleElection}>{checkElectionStatus() ? "End election" : "Start election"}</Button>
        </Stack>
      <Typography variant="h5" gutterBottom style={{ marginTop: "20px" }}>Candidates</Typography>
      <List>
        {candidates.map((candidate, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${candidate.name} (${candidate.party})`} secondary={`Votes: ${candidate.voteCount}`} />
            <Button variant="outlined" color="secondary" onClick={() => voteForCandidate(candidate.id)}>Vote</Button>
          </ListItem>
        ))}
      </List>
      <Button variant="contained" color="primary" onClick={clearCandidates}>{"Clear candidates"}</Button>
    </Container>
  );
};

export default ElectionApp;
