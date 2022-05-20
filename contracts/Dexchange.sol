//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;
pragma experimental ABIEncoderV2;
// import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Dexchange {
  address public admin;
  enum Side {
    BUY,
    SELL
  }

  struct Order {
    uint256 id;
    address trader;
    Side side;
    bytes32 ticker;
    uint256 amount;
    uint256 filled;
    uint256 price;
    uint256 date;
  }
  struct Token {
    bytes32 ticker;
    address tokenAddress;
  }

  mapping(address => mapping(bytes32 => uint256)) public balances;
  mapping(bytes32 => Token) public tokens;
  mapping(bytes32 => mapping(uint256 => Order[])) public orderBook;

  bytes32[] public tokenList;
  bytes32 public constant DAI = bytes32("DAI");

  event NewTrade(
    uint256 tradeId,
    uint256 orderId,
    bytes32 indexed ticker,
    address indexed trader1,
    address indexed trader2,
    uint256 amount,
    uint256 price,
    uint256 date
  );

  uint256 public nextOrderId;
  uint256 public nextTradeId;

  constructor() {
    admin = msg.sender;
  }

  modifier onlyAdmin() {
    require(msg.sender == admin, "only admin");
    _;
  }

  modifier tokenIsNotDai(bytes32 ticker) {
    require(ticker != DAI, "cannot trade DAI");
    _;
  }

  modifier tokenAccepted(bytes32 ticker) {
    require(
      tokens[ticker].tokenAddress != address(0),
      "this token does not exist"
    );
    _;
  }

  function getOrders(bytes32 _ticker, Side _side)
    external
    view
    returns (Order[] memory)
  {
    return orderBook[_ticker][uint256(_side)];
  }

  function getTokens() external view returns (Token[] memory) {
    Token[] memory _tokens = new Token[](tokenList.length);
    for (uint256 i = 0; i < tokenList.length; i++) {
      _tokens[i] = Token(
        tokens[tokenList[i]].ticker,
        tokens[tokenList[i]].tokenAddress
      );
    }
    return _tokens;
  }

  function addToken(bytes32 _ticker, address _tokenAddress) external onlyAdmin {
    tokens[_ticker] = Token(_ticker, _tokenAddress);
    tokenList.push(_ticker);
  }

  function deposit(bytes32 _ticker, uint256 _amount)
    external
    tokenAccepted(_ticker)
  {
    IERC20(tokens[_ticker].tokenAddress).transferFrom(
      msg.sender,
      address(this),
      _amount
    );
    balances[msg.sender][_ticker] += _amount;
  }

  function withdraw(bytes32 _ticker, uint256 _amount)
    external
    tokenAccepted(_ticker)
  {
    require(balances[msg.sender][_ticker] >= _amount, "balance to low");
    balances[msg.sender][_ticker] -= _amount;

    IERC20(tokens[_ticker].tokenAddress).transfer(msg.sender, _amount);
  }

  function createLimitOrder(
    bytes32 _ticker,
    uint256 _amount,
    uint256 _price,
    Side _side
  ) external tokenAccepted(_ticker) tokenIsNotDai(_ticker) {
    if (_side == Side.SELL) {
      require(balances[msg.sender][_ticker] >= _amount, "balance too low");
    } else {
      require(
        balances[msg.sender][DAI] >= _amount * _price,
        "DAI balance too low"
      );
    }

    Order[] storage orders = orderBook[_ticker][uint256(_side)];

    orders.push(
      Order(
        nextOrderId,
        msg.sender,
        _side,
        _ticker,
        _amount,
        0,
        _price,
        block.timestamp
      )
    );

    uint256 i = orders.length > 0 ? orders.length - 1 : 0;
    while (i > 0) {
      if (_side == Side.BUY && orders[i - 1].price > orders[i].price) {
        break;
      }

      if (_side == Side.SELL && orders[i - 1].price < orders[i].price) {
        break;
      }

      Order memory order = orders[i - 1];
      orders[i - 1] = orders[i];
      orders[i] = order;
      i--;
    }

    nextOrderId++;
  }

  function createMarketOrder(
    bytes32 _ticker,
    uint256 _amount,
    Side _side
  ) external tokenAccepted(_ticker) tokenIsNotDai(_ticker) {
    if (_side == Side.SELL) {
      require(balances[msg.sender][_ticker] >= _amount, "balance too low");
    }

    Order[] storage orders = orderBook[_ticker][
      uint256(_side == Side.BUY ? Side.SELL : Side.BUY)
    ];
    uint256 i = 0;
    uint256 remaining = _amount;

    while (i < orders.length && remaining > 0) {
      uint256 available = orders[i].amount - orders[i].filled;
      uint256 matched = (remaining > available) ? available : remaining;

      remaining -= matched;
      orders[i].filled = matched;
      emit NewTrade(
        nextTradeId,
        orders[i].id,
        _ticker,
        orders[i].trader,
        msg.sender,
        matched,
        orders[i].price,
        block.timestamp
      );
      if (_side == Side.SELL) {
        balances[msg.sender][_ticker] -= matched;
        balances[msg.sender][DAI] += matched * orders[i].price;

        balances[orders[i].trader][_ticker] += matched;
        balances[orders[i].trader][DAI] -= matched * orders[i].price;
      }

      if (_side == Side.BUY) {
        require(
          balances[msg.sender][DAI] > matched * orders[i].price,
          "DAI balance too low"
        );
        balances[msg.sender][_ticker] += matched;
        balances[msg.sender][DAI] -= matched * orders[i].price;

        balances[orders[i].trader][_ticker] -= matched;
        balances[orders[i].trader][DAI] += matched * orders[i].price;
      }
      nextTradeId++;
      i++;
    }

    i = 0;
    while (i < orders.length && orders[i].filled == orders[i].amount) {
      for (uint256 j = i; j < orders.length - 1; j++) {
        orders[j] = orders[j + 1];
      }
      orders.pop();
      i++;
    }
  }
}
