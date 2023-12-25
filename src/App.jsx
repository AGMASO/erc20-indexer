import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  CircularProgress,Card,CardBody,CardHeader,CardFooter,Stack
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { Fragment, useState } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5/react';
import { useWeb3Modal ,useWeb3ModalProvider, useWeb3ModalAccount, useDisconnect} from '@web3modal/ethers5/react'
import { ethers} from 'ethers';






// 1. Get projectId
const projectId = 'indexer';
// 2. Set chains
const sepolia = {
  chainId: 11155111,
  name: 'Sepolia',
  currency: 'ETH',
  explorerUrl: 'https://sepolia.etherscan.io/',
  rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/pDnsHSqJomhXLGvW0BD406tousjSDigY'
}
// 3. Create modal
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/']
}
//Initialize the wallet conecction
createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [sepolia],
  projectId
})

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [ loading, setLoading] = useState(false);

  //initialize wallet
  
  const {isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  async function getWalletTokenBalances(){
    console.log("estoy aqui");
    if(!isConnected) throw Error("User disconnected");
    console.log("estoy aqui 2");
    const ethersProvider =  new ethers.providers.Web3Provider(walletProvider);
    console.log("estoy aqui 3");
    const signer = await ethersProvider.getSigner();
    console.log("estoy aqui4");
    const signerAddress = await signer.getAddress();

    console.log(signerAddress);
    
    const config = {
      apiKey:"<YOUR API>",
      network: Network.ETH_SEPOLIA,
    };
      // Set loading state to true
  setLoading(true);

  try {
    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(signerAddress);

    setResults(data);
    console.log(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  } catch (error) {
    console.error("Error fetching token balances:", error);
  }finally {
    // Set loading state to false regardless of success or failure
    setLoading(false);
  }
    


  }
  async function getTokenBalance() {
    const config = {
      apiKey: "<Your api>",
      network: Network.ETH_MAINNET,
    };

    const alchemyy = new Alchemy(config);
   
    
   // Set loading state to true
   setLoading(true);

   try {
    let resolvedAddress;
    console.log("estoy aqui");
    if(/\.eth$/.test(userAddress)){
    console.log("estoy aqui 2 ");
      console.log(userAddress);
      resolvedAddress = await alchemyy.core.resolveName(userAddress);
    }else{
    console.log("estoy aqui else");

      resolvedAddress = userAddress;
    }
    console.log("estoy aqui 3");
    
    const data = await alchemyy.core.getTokenBalances(resolvedAddress);

    setResults(data);
    console.log(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemyy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
  } catch (error) {
    console.error("Error fetching token balances:", error);
  }finally {
    // Set loading state to false regardless of success or failure
    setLoading(false);
  }
  }
  return (
    <Fragment>
    <Box w= "100vw" paddingTop="20px">
      
    <Flex
      alignItems={'flex-end'}
      justifyContent="center"
      flexDirection={'row'}
      >
        <w3m-button />
        
      </Flex>
    </Box>
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text w="50%" marginTop="30px">
            Connect your Wallet to check all the Tokens asociated to your Address or Plug in an Address or ENS domain and this website will return all of its ERC-20 token balances!
          </Text>
          {isConnected ? (
             <Button fontSize={20} onClick={getWalletTokenBalances} mt={36} bgColor="blue">
             Check your ERC-20 Token Balances
             </Button>
          ) : ("")}
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          Check ERC-20 Token Balances
        </Button>

        
          {loading ? (<Flex
           w="100%"
           marginTop="30px"
           flexDirection="column"
           alignItems="center"
           justifyContent={'center'} >
            <CircularProgress isIndeterminate color='green.300' />
            </Flex>
          ) : (

          <>
            {hasQueried && (
          <Fragment>
          <Flex flexDir={"column"} minH={"500px"} alignItems="center"
           justifyContent={'center'}>
          <Heading my={36}>ERC-20 token balances:</Heading>
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Card maxW='sm' border={"dashed"} >
                <Flex 
                flexDir={"column"}
                alignItems="center"
           justifyContent={'center'}
                >
                  {!tokenDataObjects[i].logo ? ("")  : (<Image
                    src={tokenDataObjects[i].logo}
                    alt='token logo'
                    borderRadius='lg'
                  /> )}
                  <Stack mt='6' spacing='3'>
                    <Heading size='md'>{tokenDataObjects[i].symbol}</Heading>
                    
                    <Text color='blue.600' fontSize='2xl'>
                    Balance: {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i].decimals
                    )}
                    </Text>
                  </Stack>
                </Flex>
                
              </Card>
              );
            })}
          </SimpleGrid>
          </Flex>
          </Fragment>
        )}
          </>

          )}
       
      </Flex>
    </Box>
    </Fragment>
  );
}

export default App;
