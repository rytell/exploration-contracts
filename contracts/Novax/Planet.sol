pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Novax.sol";

contract Planet is ERC721 {
  struct Item {
    uint256 no;
  }

  Item[] public items;
  address public owner;
  string private buri =
    "https://u9xw2azhpf.execute-api.eu-central-1.amazonaws.com/default/NovaXPlanetMetadata/";

  function setBuri(string memory value) public onlyOwner {
    buri = value;
  }

  //Planet metadatas
  mapping(uint256 => mapping(string => uint256)) private params1;
  mapping(uint256 => mapping(string => string)) private params2;

  function setParam1(
    uint256 planetId,
    string memory key,
    uint256 value
  ) public onlyNovax {
    params1[planetId][key] = value;
  }

  function setParam2(
    uint256 planetId,
    string memory key,
    string memory value
  ) public onlyNovax {
    params2[planetId][key] = value;
  }

  //Getters
  function getParam1(uint256 planetId, string memory key)
    public
    view
    returns (uint256)
  {
    return params1[planetId][key];
  }

  function getParam2(uint256 planetId, string memory key)
    public
    view
    returns (string memory)
  {
    return params2[planetId][key];
  }

  function _baseURI() internal view override returns (string memory) {
    return buri;
  }

  constructor() public ERC721("NovaXPlanet", "XPLN") {
    owner = msg.sender;
  }

  function MAX_PLANETS() public view returns (uint256) {
    return 8888;
  }

  function createItem(address _to)
    public
    payable
    onlyNovaxGame
    returns (uint256)
  {
    uint256 id = items.length;
    require(id < MAX_PLANETS());
    items.push(Item(id));
    _mint(_to, id);
    return id;
  }

  function tokensOfOwner(address _owner)
    external
    view
    returns (uint256[] memory)
  {
    uint256 tokenCount = balanceOf(_owner);
    if (tokenCount == 0) {
      // Return an empty array
      return new uint256[](0);
    } else {
      uint256[] memory result = new uint256[](tokenCount);
      uint256 index;
      uint256 index2;
      for (index = 0; index < items.length; index++) {
        if (ownerOf(index) == _owner) {
          result[index2] = index;
          index2++;
        }
      }
      return result;
    }
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier onlyNovaxGame() {
    Novax novax = Novax(0x7273A2B25B506cED8b60Eb3aA1eAE661a888b412);
    address metadataSetter = novax.getParam3("game");

    require(metadataSetter != address(0));
    require(msg.sender == metadataSetter);
    _;
  }

  modifier onlyNovax() {
    Novax novax = Novax(0x7273A2B25B506cED8b60Eb3aA1eAE661a888b412);
    address metadataSetter = novax.getParam3("metadataSetter");

    require(metadataSetter != address(0));
    require(msg.sender == metadataSetter);
    _;
  }
}
