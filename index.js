const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk')
const ethers = require('ethers')
const chainId = ChainId.MAINNET
const tokenAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // dai
const provider = ethers.getDefaultProvider('mainnet', {
    infura: 'https://mainnet.infura.io/v3/b645e25b34be4500839f36799503825e'
})
const PRIVATE_KEY = ''
const PUBLIC_KEY = ''

const main = async () => {
    // Use infura node for fetching data
    const dai = await Fetcher.fetchTokenData(chainId, tokenAddress, provider);
    const weth = WETH[chainId]
    const pair = await Fetcher.fetchPairData(dai, weth, provider)
    const route = new Route([pair], weth)
    const trade = new Trade(route, new TokenAmount(weth, '1000000000000000'), TradeType.EXACT_INPUT)
    console.log('WETH price in Dai: ', route.midPrice.toSignificant(6))
    console.log('Dai price in WETH: ', route.midPrice.invert().toSignificant(6))
    console.log('Trade Execution Price: ', trade.executionPrice.toSignificant(6))
    console.log('Next Mid Price: ', trade.nextMidPrice.toSignificant(6))

    const slippageTolerance = new Percent('50', '10000')
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw
    const path = [weth.address, dai.address]
    const to = PUBLIC_KEY
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10
    const value = trade.inputAmount.raw

    // Connect
    const signer = new ethers.Wallet(PRIVATE_KEY)
    const account = signer.connect(provider)
    const uniswap = new ethers.Contract(
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2 Router
        ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'], // Uniswap ABI
        account // transacting account
    )

    // Send transaction
    const tx = await uniswap.sendExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline,
        { value, gasPrice: 20e9 }
    )
    console.log(`Transaction hash: ${tx.hash}`)

    const receipt = await tx.wait()
    console.log(`Transaction was mined in block ${receipt.blockNumber}`)
}

main()