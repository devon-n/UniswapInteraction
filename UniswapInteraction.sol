// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

// import 'https://github.com/Uniswap/v2-periphery/blob/master/contracts/UniswapV2Router02.sol';
// import 'https://github.com/Uniswap/v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router01.sol';

interface IUniswap {
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function WETH() external pure returns (address);
}

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount,
    ) external returns (bool);

    function approve(
        address spender,
        uint256 amount
    ) external returns (bool);
}

contract UniswapInteraction {
    IUniswap uniswap;

    constructor(address _uniswap) {
        uniswap = IUniswap(_uniswap);
    }

    function swapTokensForETH(
        address token,
        uint amountIn,
        uint amountOutMin,
        uint deadline
    ) external {
        // Send and approve Uniswap for transactions
        IERC20(token).transferFrom(msg.sender, address(this), amountIn);
        IERC20(token).approve(address(uniswap), amountIn);

        // Create pair array
        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = uniswap.WETH();

        // Swap tokens
        uniswap.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
    }
}
