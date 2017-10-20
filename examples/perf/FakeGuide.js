var Ui = {
    COLORS: {
        TRANSPARENT: 0x000e0e17,
        ALPHA: 0x1f101010,
        SOLID: 0xff101010
    },
    KEYS: {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        ENTER: 13,
        BACKSPACE: 8,
        MENU: 27
    }
};

var startTime = new Date();
var getNowDate = function() {
    var d = new Date();
    d.setTime((d.getTime() - startTime.getTime()) + 1485615798099);
    return d;
};

var Guide = function(stage) {
    
    this.stage = stage;
    
    this.channels = [];

    // The currently selected program.
    this.selectedProgram = null;

    // The currently used search date.
    this.searchDate = null;

    this.prevMinChannelIndex = -1;
    this.prevMaxChannelIndex = -1;

    this.nowIndicatorInterval = null;

    this.updateGuideInfoTimeout = null;

    // We provide an anchor so that our numbers won't get rounded.
    this.baseSecs = Math.floor((getNowDate()).getTime() / 1000);

    this.vchannels = [{"manifest":"http://link.theplatform.com/s/LgiNlP/tSiaxl7ldWOh","id":"Nederland_1_HD","name":"NPO 1 HD","image":{"href":"https://assets.lgi.io/images/000ed1649c15550369f7ada589abfff5818ac0c4.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/xpnVfGLZ9pFl","id":"Nederland_2_HD","name":"NPO 2 HD","image":{"href":"https://assets.lgi.io/images/ec1b73c715f3d9d05dfc579b43cd59c9f3bcaa5a.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/X8MxqXlckQU6","id":"Nederland_3_HD","name":"NPO 3 HD","image":{"href":"https://assets.lgi.io/images/8c31b2bccf1b071adc7fbf1334558f10f40e086b.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/4YKg163BM1HM","id":"RTL4_HD","name":"RTL 4 HD","image":{"href":"https://assets.lgi.io/images/4351184d67066a5eb12c3e80b5dbbca3838d14de.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/GlG8J4bDXIvl","id":"RTL5_HD","name":"RTL 5 HD","image":{"href":"https://assets.lgi.io/images/47c81bc9d3dae2c91512cae8216f0396572f6dcb.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/YNY22fHRcpC4","id":"SBS6_HD","name":"SBS6 HD","image":{"href":"https://assets.lgi.io/images/ba7298bbe10c2c50466e77befd166cdea2d3f4bc.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/gO7BZFpZIBjf","id":"RTL7_HD","name":"RTL 7 HD","image":{"href":"https://assets.lgi.io/images/fe5963e9d6e5ade3d26a576dffab6986f1e50f20.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/HDJNniGmr3KW","id":"Veronica_HD","name":"Veronica HD / Disney XD","image":{"href":"https://assets.lgi.io/images/53f40c542202369f8a5aef9e757d45c1ee9ad568.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/uVhF6SaCw4tO","id":"Net5_HD","name":"Net5 HD","image":{"href":"https://assets.lgi.io/images/f70ea6de104c3530c7c5e47fb0882f2ce369be18.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ivtqMvNPcpLP","id":"RTL8_HD","name":"RTL 8 HD","image":{"href":"https://assets.lgi.io/images/68143d70e34b5b17968f99594b8ffdb231367750.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/hRArAXZWxmQ2","id":"FOX_HD","name":"FOX HD","image":{"href":"https://assets.lgi.io/images/4e040837868e9ee34f226261fcb26d337a7f00dc.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/QnR0_1gU7ilD","id":"RTLZ_HD","name":"RTL Z HD","image":{"href":"https://assets.lgi.io/images/45cac8013d73f58577b6a344c73ad94d7ef20a86.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/PbOvxzFrMA_m","id":"Ziggo_TV_HD","name":"Ziggo TV HD","image":{"href":"https://assets.lgi.io/images/13659d89145ad692944b85a5996cf12e65a02449.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ky_pZUwbs5vw","id":"Ziggo_Sport_HD","name":"Ziggo Sport HD","image":{"href":"https://assets.lgi.io/images/885101407d6631252ecacc9104099346e0f0dfc7.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/RdK1qQHdcIca","id":"Kindernet_Comedy_Central_HD","name":"Comedy Central HD","image":{"href":"https://assets.lgi.io/images/21aa5cca71dcd033fdebe8c78138654d3cb525c7.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/DYu_5cDtCu0P","id":"Spike_HD","name":"Spike HD","image":{"href":"https://assets.lgi.io/images/945885e42d9098ac9ca3a6a86e4b70115ac43fed.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/tRdqSrMaByo_","id":"Nickelodeon_HD","name":"Nickelodeon HD","image":{"href":"https://assets.lgi.io/images/75e8729b836174cac9f8c149b17d4c22d34f8cdc.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/9RvvlFh1G4CI","id":"Discovery_HD","name":"Discovery HD","image":{"href":"https://assets.lgi.io/images/2502bea859229e5ddedf6fdba73722c6c72019ec.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/JDa3ylJQrv_A","id":"Nat_Geo_HD","name":"National Geographic Channel HD","image":{"href":"https://assets.lgi.io/images/1409c00f27547e4e92d1b97a1d2127f6a9877c9e.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/wl0QYK867kb3","id":"SBS_9_HD_v2","name":"SBS9 HD","image":{"href":"https://assets.lgi.io/images/f433dd983127e3f2817f590d382d20e40887bde9.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/v2fAuZ3sTdqH","id":"Eurosport_HD","name":"Eurosport 1 HD","image":{"href":"https://assets.lgi.io/images/d998931cdac33d61d0cf61172682c5b6805a0b36.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ODy95iRH7qGn","id":"TLC_HD_v2","name":"TLC HD","image":{"href":"https://assets.lgi.io/images/684591fc07df3db3093288a0ca8ca2056487a3d6.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/up_tW4yR48a3","id":"BBC_First_HD","name":"BBC First HD","image":{"href":"https://assets.lgi.io/images/e3e0a6cfa640ce6ee8af569e6d8aa8d873b2ad92.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/9vUi4lVwAZsl","id":"MTV_HD","name":"MTV HD","image":{"href":"https://assets.lgi.io/images/197a299faf47d4197d8685bbb3565bb9c115f391.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/KV8_RU5g7xLW","id":"24_Kitchen_HD_v2","name":"24Kitchen HD","image":{"href":"https://assets.lgi.io/images/995aefb66527b7a35db3d0352da3293f197bdddb.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/d287saQQhYfI","id":"Xite","name":"XITE","image":{"href":"https://assets.lgi.io/images/144ed8204e2337486b9c97d6437c2f35326b3513.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/T79I2Fm3Mhja","id":"Foxlife_HD_v2","name":"FOXlife HD","image":{"href":"https://assets.lgi.io/images/8a04d6601e4c322f961360bbe5f582e54d6a5ea2.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ax2YkBb9eVI9","id":"Disney_Channel_HD","name":"Disney Channel HD","image":{"href":"https://assets.lgi.io/images/12942044b10ced27eac4c5348f36efced37b24c0.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ZuZv2WjPaCwG","id":"History_HD_v2","name":"HISTORY HD","image":{"href":"https://assets.lgi.io/images/fa759c4266fc6cf64334dd1fb1926f3b9d9eca6a.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/99hAO22JqUhy","id":"CC_Family_v2","name":"Comedy Central Family","image":{"href":"https://assets.lgi.io/images/9d9bcc18541fdfdf6b3f151ff6b315fe05f3d6c9.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/bXKGYS_S1aHQ","id":"Een_HD","name":"één HD","image":{"href":"https://assets.lgi.io/images/5e97c2abe50cb03c3ae2bc774c28124f2918bfbd.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/wqgTPQ4oViGw","id":"Canvas_HD","name":"Canvas HD","image":{"href":"https://assets.lgi.io/images/de1197075b607e47f74f8b348e0ac6cb5a4970a7.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/R_G3nxiZ5hE_","id":"Ketnet","name":"Ketnet","image":{"href":"https://assets.lgi.io/images/fea81b33121f2cec656b6f32faddbbc86a1a0ebe.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/8MS56xoogKVx","id":"ARD_HD_v2","name":"ARD HD","image":{"href":"https://assets.lgi.io/images/d24cb38f04c5e82d9b4c6508418d66b071824de1.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/7hxMNErS6HKP","id":"ZDF_HD_v2","name":"ZDF HD","image":{"href":"https://assets.lgi.io/images/a34453a78c244dc0cb57c7ee8ee8a380d9837975.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/_3fHzLRQ1b_N","id":"WDR_v2","name":"WDR","image":{"href":"https://assets.lgi.io/images/f22498c637020d6eb48b05f5ad630ef3a2ee255c.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/vuZYpaMg5Fx7","id":"BBC_ONE_HD","name":"BBC One HD","image":{"href":"https://assets.lgi.io/images/50f37b8220fc13f8c949d285f41f3cd03588b8d1.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/KDBLtemGEuWR","id":"BBC_2_HD","name":"BBC Two HD","image":{"href":"https://assets.lgi.io/images/62329e5ff53c52455db60ea0e0cebf0dc03a7bf0.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/4sNBZKOzZ1uL","id":"TV5","name":"TV5 Monde","image":{"href":"https://assets.lgi.io/images/004feb6210a00cdd7100fd6fe275adb79759420a.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/8OhvJAXdAEKS","id":"HBO_HD1_v2","name":"HBO HD","image":{"href":"https://assets.lgi.io/images/01f28211f6447c5dbb28db4ff8718396cbecf374.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/TeASDIMRP3J6","id":"HBO_2HD","name":"HBO2 HD","image":{"href":"https://assets.lgi.io/images/5b5003f689bf372dc88285ca615e98795afbe6bf.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/cLEkjNr42nlR","id":"HBO_3HD","name":"HBO3 HD","image":{"href":"https://assets.lgi.io/images/55396ea19147fe39bb3c25fa8f7b1fce9bd70e12.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/XeCyvt75D3gn","id":"RTL_Crime","name":"RTL Crime","image":{"href":"https://assets.lgi.io/images/28161f95ec1e584fac1a62152bb41f6f2165789f.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/Rk1B_NpdFjuP","id":"Crime_and_Invest_v2","name":"CI","image":{"href":"https://assets.lgi.io/images/d286d46620c1b25db741e4bf5e48e79a240d67c6.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/OrJrhV0Y9hQh","id":"Investigation_Discovery","name":"ID","image":{"href":"https://assets.lgi.io/images/464128ef7330d8653137a0e24737ba96d16b5acf.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/16_zKmSCT0E_","id":"Comedy_Central_Extra_v2","name":"Comedy Central Extra","image":{"href":"https://assets.lgi.io/images/61d899662101bc11cf68aae0162eb34e158fed46.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/zFG2T01MCYX5","id":"Shorts_TV","name":"Shorts TV","image":{"href":"https://assets.lgi.io/images/64c03200095b108c3598fd52872fb40142cafccd.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/Alt_rrjm5lY2","id":"101","name":"NPO 101","image":{"href":"https://assets.lgi.io/images/dfbe30134714dcb412faa9b91538725d4ae56df8.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ZKvABe6_1UfU","id":"OUTtv","name":"OUTTV","image":{"href":"https://assets.lgi.io/images/5f43d6a42ff4262a9e1aff7e10d2cd6d8f709a8e.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/TE90Glsk_zUj","id":"AMC","name":"AMC","image":{"href":"https://assets.lgi.io/images/259759c9124865c867631bca67e65046be48232d.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/PouavGYeJQVc","id":"Horse_Country","name":"Horse & Country TV","image":{"href":"https://assets.lgi.io/images/bf45679e2ccfc14780335f4cd13399a4677f76dc.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/glw_U_Wz0atg","id":"Food_Network_SD","name":"Food Network","image":{"href":"https://assets.lgi.io/images/9a3336465a64dbd462dc932e4b3bee01c98165b6.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/HWlrBkI_UGSo","id":"Fine_living_SD","name":"Fine Living","image":{"href":"https://assets.lgi.io/images/9f067ccd6725bf00b39f44ae7c14a3fb3234fe29.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/OVZqyFNWFnSJ","id":"RTL_Lounge","name":"RTL Lounge","image":{"href":"https://assets.lgi.io/images/19f8895f6698eae19948a5364d48b96e262e33a7.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/1WY8LJOOaMDI","id":"Discovery_Science","name":"Discovery Science","image":{"href":"https://assets.lgi.io/images/17d65056af13e3d77f7df4edf6fc50656e3e494b.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/FknAuqaIVtI9","id":"Discovery_World","name":"Discovery World","image":{"href":"https://assets.lgi.io/images/4d1c4662a50d932dc3f0ca3f8aa37571ac3f1528.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/GZo9siApMP9E","id":"Nat_Geo_Wild_HD_v2","name":"Nat Geo Wild HD","image":{"href":"https://assets.lgi.io/images/a2f3279c3ccf8be83f1d53b780b9752840b6f25f.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/nfe3Z9_ADujy","id":"Travel_Channel_HD_v3","name":"Travel Channel HD","image":{"href":"https://assets.lgi.io/images/37cdd6f1da6801f44b681142919304517bbd4ae3.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/XZscJxEujiRq","id":"NostalgieNet","name":"ONS","image":{"href":"https://assets.lgi.io/images/b8bdf61906e3e399300b4b419f725923cdef25e2.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/Zd8pxEpPnxLs","id":"Disney_XD","name":"Disney XD","image":{"href":"https://assets.lgi.io/images/332105f065499224a02da8e49a6c8b5de10135bc.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/2mrn7tYvZE19","id":"Disney_Junior_V2","name":"Disney Junior","image":{"href":"https://assets.lgi.io/images/2abe3f032a5acf9b0f6417be72f0e4f9eeb85687.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/6XSJel_4DNli","id":"Nick_JR","name":"Nick Jr.","image":{"href":"https://assets.lgi.io/images/5c34e8e67872c3817a76d860b310a97876fae0da.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/N7RH7NB2Md3J","id":"Cartoon_Network","name":"Cartoon Network","image":{"href":"https://assets.lgi.io/images/f27db6bb2c56a4eb9913ebae1d6c979fd3f3e8d6.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/P7ScN2r81XYo","id":"JimJam","name":"JimJam","image":{"href":"https://assets.lgi.io/images/12bb3baa6700e7e7cb24a157d6cf3fcc6a09aa0c.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/zrQtPo0uB3sj","id":"NPO_Zapp_Xtra","name":"NPO Zapp Xtra / Best","image":{"href":"https://assets.lgi.io/images/573ffa1e1d47ca13c900d3b9b9c283c1034c00c2.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/azgIOLiGKUzo","id":"RTL_Telekids","name":"RTL Telekids","image":{"href":"https://assets.lgi.io/images/8047440f61483f10064ffda7584f6384d05f97b0.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/8eNVhQBfBfD3","id":"Sport_1_Select_HD","name":"Ziggo Sport Select HD","image":{"href":"https://assets.lgi.io/images/a625d40caab248d0e60de2089198b3630bb81002.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/8fC57Or9S2nS","id":"Sport_1_Voetbal_HD","name":"Ziggo Sport Voetbal HD","image":{"href":"https://assets.lgi.io/images/9d83c73af69ae54dccd055f5fcc6db5cba530fe2.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/gyKLLwi82I9o","id":"Ziggo_Sport_Golf","name":"Ziggo Sport Golf","image":{"href":"https://assets.lgi.io/images/879275bd884af7159695cc72c237346f8fb0aa61.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/UhDbJa7XG3ks","id":"Sport_1_Tennis","name":"Ziggo Sport Racing","image":{"href":"https://assets.lgi.io/images/cc385cb0bc35dad0e53d47e390a265240ecb51ab.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/99L1FP18cbqj","id":"Sport_1_Extra_1","name":"Ziggo Sport Extra1","image":{"href":"https://assets.lgi.io/images/8e0b06d0612d63b12fde945c873ad3b8c2025f54.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/DWOakEEQTj9q","id":"Sport_1_Extra_2","name":"Ziggo Sport Extra2","image":{"href":"https://assets.lgi.io/images/c663788918d5cda9bf85e86b4408cd2e7a0f6e71.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/4etEo437sZi7","id":"Eurosport_2_HD_v2","name":"Eurosport 2 HD","image":{"href":"https://assets.lgi.io/images/6e97922b659fb3e4e81a27218b12a7af03c817e8.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/t4sUBt_ZEo5Q","id":"Extreme_Sports","name":"Extreme Sports Channel","image":{"href":"https://assets.lgi.io/images/514379b10c1a2429182593d8ead4b21b02f667cb.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/RijGzWVhbPoF","id":"FOX_Sports_1HD_Eredivisie","name":"FOX Sports 1 Eredivisie HD","image":{"href":"https://assets.lgi.io/images/fbe8d09c08b638ead51e0acfd29fbde5c7206f41.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/JRn02uqWnsrZ","id":"Fox_Sports_2HD","name":"FOX Sports 2 HD","image":{"href":"https://assets.lgi.io/images/245effed7beab4c22b8545da025dd9a8bc1918fe.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/HqRPUzDfp0n3","id":"Fox_Sports_3HD_Eredivisie","name":"FOX Sports 3 Eredivisie HD","image":{"href":"https://assets.lgi.io/images/8c71a5cf550921b223d3943110bcc8ed6460f40c.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/u5_KfDxv3fNF","id":"FOX_Sports_4HD","name":"FOX Sports 4 HD","image":{"href":"https://assets.lgi.io/images/4a3a8baf35b76df0d4e0e717efd06706f63cf62e.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/DNuIzTfmA9jT","id":"FOX_Sports_5HD_Eredivisie_v2","name":"FOX Sports 5 Eredivisie HD","image":{"href":"https://assets.lgi.io/images/34a57f8fc10f1b93ca070035a90d61288ed4043c.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ai71aI32BOxA","id":"Fox_Sports_6HD","name":"FOX Sports 6 HD","image":{"href":"https://assets.lgi.io/images/bb76c4c0cf77501908cf04cc4be6f4439131b29f.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/uFke4Idlnc7v","id":"Journaal_24","name":"NPO Nieuws","image":{"href":"https://assets.lgi.io/images/5df8afcc1778b9c2adca09ba666170712f5f5687.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/FKeX5_3F_sqf","id":"Politiek_24","name":"NPO Politiek","image":{"href":"https://assets.lgi.io/images/1c624cd56b198931210d3ee6bed2a164469697bc.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/V07SRqSyHCLn","id":"CNN_v2","name":"CNN","image":{"href":"https://assets.lgi.io/images/27e5fb82245ce12f0a8e5138c965c11d6020fd24.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/dx6h3TQleprE","id":"BBC_World_News","name":"BBC World News","image":{"href":"https://assets.lgi.io/images/6e4ac3fe41c5472ead217accc813cb698be26cce.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/sUSc8N3vwem7","id":"Euronews","name":"Euronews","image":{"href":"https://assets.lgi.io/images/f7a39e971ee7b717313ac469e8046aac95159a15.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/xlhufkyQ97ej","id":"CNBC","name":"CNBC Europe","image":{"href":"https://assets.lgi.io/images/d63a422b859762bf85271e9fbdd8e68e4e38f186.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/t9L2OfQYGMaL","id":"TV_538_v2","name":"TV538","image":{"href":"https://assets.lgi.io/images/cebc3f01b9138bcd800e4c1d296532e0699b6d93.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/_Ymez8d91noz","id":"MTV_Music_24","name":"MTV Music 24","image":{"href":"https://assets.lgi.io/images/2e661c78d1d47085575dd5c554b82fca9b938cb5.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/qalh8IW5frCK","id":"Dance_Trippin_TV","name":"DanceTrippin","image":{"href":"https://assets.lgi.io/images/4835a2a43f225427776975d6b9f99e435b0341c2.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/NuA8GY2YjBBi","id":"SlamTV","name":"SLAM","image":{"href":"https://assets.lgi.io/images/36d8555c59d953c3897a704796e795e0de9ead37.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/37jm8oQ0u2mh","id":"Lite_TV","name":"Stingray LiteTV","image":{"href":"https://assets.lgi.io/images/cb3210cd7ef05426e5dfafeb381c7458d4ad9b41.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/nslkRhNiZc1w","id":"BravaNL","name":"Brava","image":{"href":"https://assets.lgi.io/images/6c85049ba7a0b6eaee16657128059f7e8fdef656.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/d1UNsTU87xCA","id":"Mezzo","name":"Mezzo","image":{"href":"https://assets.lgi.io/images/c7a3e1ef1acda9a878ab126a7517b04563f97054.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/llTQ6oDzXXW9","id":"TV_Oranje","name":"TV Oranje","image":{"href":"https://assets.lgi.io/images/1fe886878e37fdaa59e7feb84b6fa65de4d32ae4.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/Hn1D8WrCRwy4","id":"RTV_Noord","name":"TV Noord","image":{"href":"https://assets.lgi.io/images/a4c90fdc9ed09deec2da9e98578eda9f48bf0025.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/pviEHpuBqp2K","id":"Omrop_Fryslan","name":"Omrop Fryslân","image":{"href":"https://assets.lgi.io/images/f517fcbdb436b3c496b885bc87fdd56d9dc75658.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/1vVH1fRGNrzm","id":"RTV_Drenthe","name":"TV Drenthe","image":{"href":"https://assets.lgi.io/images/61d0242405788ee2d98223566237b4a12480891b.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/q6KGe518MQ11","id":"RTV_Oost","name":"TV Oost","image":{"href":"https://assets.lgi.io/images/ae9896ec2759e5ea18085abd2bb919660eea0f34.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/oq_7pqkN3b1l","id":"RTV_Gelderland","name":"TV Gelderland","image":{"href":"https://assets.lgi.io/images/3b2f70aebd9fd86026072e2265aaa398ea4b550e.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/__01iEFdbyE3","id":"Omroep_Flevoland","name":"Omroep Flevoland","image":{"href":"https://assets.lgi.io/images/d401605b6fb2b7e0f7850b7940f61e58e93b97f6.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/nMLpZn0_2wu3","id":"RTV_Noord-Holland","name":"NH","image":{"href":"https://assets.lgi.io/images/a920e0b7fe507a8c9198639dfbfc6952f3d0c1be.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/BJdj3tSV4Rsq","id":"TV_Utrecht","name":"RTV Utrecht","image":{"href":"https://assets.lgi.io/images/dfe0006e9a6aaa76cfea10717a6a72ade49fcbeb.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/TyVhe5MNHsfV","id":"TV_West","name":"TV West","image":{"href":"https://assets.lgi.io/images/76e3419d2886dccb278286cf3db795b3342bbf3a.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/A3IhnyXZA_4J","id":"TV_Rijnmond","name":"TV Rijnmond","image":{"href":"https://assets.lgi.io/images/be5ca3d20af5cb682692d33b9ad7c845ce127ee5.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/dQCtm6E2FFep","id":"Omroep_Zeeland","name":"Omroep Zeeland","image":{"href":"https://assets.lgi.io/images/d7408862dec4adad02e3d3d302f93db1c0f3d22f.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/MJBkNqGdBh12","id":"Omroep_Brabant","name":"Omroep Brabant","image":{"href":"https://assets.lgi.io/images/3ca47362809025216afc196488d74cbc50e09eac.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/uicsc0Q7lEoE","id":"Omroep_Limburg","name":"L1 TV","image":{"href":"https://assets.lgi.io/images/e316ad095d48d39cfa68295c7dad42ec575b540e.png","isExternal":true}},{"manifest":"http://link.theplatform.com/s/LgiNlP/ZKvABe6_1UfU","id":"OUT_tv","name":"OUTTV","image":{"href":"https://assets.lgi.io/images/5f43d6a42ff4262a9e1aff7e10d2cd6d8f709a8e.png","isExternal":true}}];

    var ctr = 0;
    this.vchannels.forEach(function(v) {
        v.index = ctr++;
        v.random = Math.random();
    });


};

Guide.prototype.getCurrentChannelIndex = function() {
    return 0;
};

Guide.prototype.getProgramsInRange = function(channel, start, end, cb) {
    var duration = ((10 + (channel.index % 8) * 2) * 60 * 1000);
    // 1 Program per 45 minutes.
    var s = Math.floor((start.getTime() + 1) / duration);
    var e = Math.floor((end.getTime() - 1) / duration);

    var arr = [];
    for (var i = s; i <= e; i++) {
        var title = channel.name + " " + start.toISOString();
        var o = {start: new Date(i * duration), end: new Date((i + 1) * duration - 1), title: title, video: {synopsis: "Lorem ipsum dolor set amet. Lorem ipsum dolor set amet. Lorem ipsum dolor set amet. Lorem ipsum dolor set amet. Lorem ipsum dolor set amet. Lorem ipsum dolor set amet. Lorem ipsum dolor set amet." + Math.random(), imageLink: {href: "fakeguide-program.jpg?v=" + Math.floor(Math.random() * 100)}}};
        arr.push(o);
    }

    setTimeout(function() {
        cb(null, arr);
    }, 200);
};

Guide.prototype.init = function() {
    this.build();

    var channelsCtr = this.ctr.tag('guide-channels');

    // Add channels.
    var i, n = this.vchannels.length;
    for (i = 0; i < n; i++) {
        var gc = new GuideChannel(this, i, this.vchannels[i]);
        gc.ctr.Y = i * Guide.CHANNEL_HEIGHT;
        gc.ctr.fastForward('y');
        this.channels.push(gc);
        channelsCtr.addChild(gc.labelCtr);
        this.area.addChild(gc.ctr);
    }
};

Guide.prototype.build = function() {
    var s = this.stage;

    // Create component structure and add transition listeners.
    this.ctr = s.c({tag: 'guide', x: 0, y: 0, h: 720, w: 1280, rect: true, color: Ui.COLORS.SOLID, visible: false, children: [
        {tag: 'guide-time-line', visible: true, x: 240, y: 50, w: 1280 - 240, h: 30, clipping: true, children: [
            {tag: 'guide-time-lines'}
        ]},
        {tag: 'guide-date-background', colorLeft: 0x00000000, colorRight: 0xff000000, w: 300, h: 90, x: 980, rect: true, children: [
            {tag: 'guide-date', x: 235, y: 47, mountX: 1, color: 0xff999999, text: {fontSize: 20, text: 'today'}}
        ]},
        {tag: 'guide-mask',x: 70, y: 90, children: [
            {tag: 'viewport', x: 170, w: 1280 - 240, h: Guide.VIEWPORT_HEIGHT, clipping: true, children: [
                {tag: 'area', children: [
                    {tag: 'active-border', x: 0, h: 4, w: 0, rect: true, colorLeft: 0xfff9b84f, colorRight: 0xfff8dda4, zIndex: 4}
                ]}
            ]},
            {x: 0, y: 0, w: 170, h: Guide.VIEWPORT_HEIGHT, clipping: true, zIndex: 6, rect: true, color: 0xff101010, children: [
                {tag: 'guide-channels', zIndex: 6}
            ]}
        ]},
        {tag: "indicator-block", x: 240, y: 87, h: Guide.VIEWPORT_HEIGHT + 6, zIndex: 5, children: [
            {tag: "indicator", x: 0, w: 2, h: Guide.VIEWPORT_HEIGHT + 6, rect: true},
            {tag: "indicator-shadow", x: -200, w: 200, h: Guide.VIEWPORT_HEIGHT + 6, rect: true, colorLeft: 0x00101010, colorRight: 0xff101010, alpha: 0.5}
        ]},
        {tag: 'guide-info', x: 70, y: 600, scale: 0.5, children: [
            {tag: 'guide-info-image', x: 0, y: 0, w: 120, h: 180},
            {tag: 'guide-info-title', x: 150, y: -5, w: 690, text: {text: "", maxLines:1, fontSize: 32}},
            {tag: 'guide-info-general', x: 150, y: 41, children: [
                {tag: 'guide-info-general-time', color: 0xff999999, text: {text: "", fontSize: 18}},
                {tag: 'guide-info-general-bullet-1', y: 9, color: 0xff999999, text: {text: "V", fontFace: "HorizonIcons", fontSize: 6}},
                {tag: 'guide-info-general-duration', color: 0xff999999, text: {text: "", fontSize: 18}},
                {tag: 'guide-info-general-bullet-2', y: 9, color: 0xff999999, text: {text: "V", fontFace: "HorizonIcons", fontSize: 6}},
                {tag: 'guide-info-general-genre', color: 0xff999999, text: {text: "", fontSize: 18}},
                {tag: 'guide-info-general-now', x: 0, y: 2, w: 41, h: 22, rect: true, color: 0xff999999, texture: Tools.getRoundRect(s, 41, 22, 2), children: [
                    {tag: 'guide-info-general-now-text', y: 3, w: 41, color: 0xff30231a, text: {text: "NOW", textAlign: "center", fontSize: 13, fontFace: "proximaSemiBold"}}
                ]},
                {tag: 'guide-info-general-age', y: 2, color: 0xff999999, text: {text: "e", fontSize: 16, fontFace: "HorizonIcons"}}
            ]},
            {tag: 'guide-info-description', x: 150, y: 70, w: 600, text: {text: "", fontSize: 20, maxLines: 4, lineHeight: 28}}
        ]}
    ]});

    this.hideGuideInfoAnimation = this.ctr.tag('guide-info').animation({duration: 0.3, stopDuration: 0.15}, [
        {tags: [''], property: 'alpha', value: {0: 1, 1: 0.2}}
    ]);

    this.viewport = this.ctr.tag('viewport');

    this.area = this.ctr.tag('area');
    this.area.transition('x', {duration: 1.0});
    this.area.transition('y', {duration: 0.5});
    this.ctr.tag('guide-channels').transition('y', {duration: 0.5});

    // Add timeline components, starting with 00:00 up to 23:30 and then repeating until 04:00.
    var timelineCtr = this.ctr.tag('guide-time-lines');
    for (var minute = 0; minute < 28 * 60; minute += 30) {
        var t = this.getHourMinutesString(minute % (24 * 60));
        var x = Guide.PIX_PER_SECOND * minute * 60;
        var ctr = s.c({x: x - 2 /* to align with inter-program spacing */, w: 2, h: 20, color: 0xff303030, rect: true, children: [
            s.c({x: 8, y: -2, color: 0xff999999, text: {fontSize: 20, text: t}})
        ]});
        timelineCtr.addChild(ctr);
    }

    var self = this;
    this.area.transition('x').on('start', function() {
        self.updateArea();
    });
    this.area.transition('y').on('start', function() {
        self.updateArea();
    });
    this.area.transition('x').on('finish', function() {
        self.updateArea();
    });
    this.area.transition('y').on('finish', function() {
        self.updateArea();
    });

    this.area.transition('x').on('progress', function() {
        self.updateAreaLive();
    });

};

Guide.prototype.getHourMinutesString = function(minutes) {
    var hours = (minutes/60)|0;
    minutes -= hours * 60;
    var str = "";
    if (hours < 10) {
        str += "0";
    }
    str += hours + ":";
    if (minutes < 10) {
        str += "0";
    }
    str += minutes;
    return str;
};

Guide.prototype.show = function(skipReset) {
    // Scroll to channel immediately.
    var channel = this.channels[this.getCurrentChannelIndex()];

    var self = this;
    var now = getNowDate();

    if (!skipReset) {
        // Scroll page to current time.
        this.scrollToPage(now, true);

        this.searchDate = now;

        // Destroy all time windows (clean up memory).
        this.channels.forEach(function(channel) {
            channel.resetTimeWindows();
        });

        // Get time window for now.
        var timeWindowDate = this.getTimeWindow(now);

        // Load.
        if (channel.hasLoadedTimeWindow(timeWindowDate)) {
            // Already loaded.

            // Select current program.
            var program = channel.getProgramRunningAt(now);
            this.selectProgram(program, true, false);
        } else {
            // Block key events.
            this.blocked = true;

            var cancelled = false;

            // Show channel already as selected.
            if (this.selectedProgram) {
                this.selectedProgram.channel.deselect(true);
            }
            channel.select(true);
            this.recalcChannelPositions(true);
            this.scrollToChannel(channel, true);

            this.ctr.tag('active-border').visible = false;

            //@todo: show 'loader'.
            this.updateGuideInfoLoading();

            channel.loadTimeWindow(timeWindowDate, function() {
                if (cancelled) return;

                self.blocked = false;

                // Select current program.
                var program = channel.getProgramRunningAt(now);
                self.selectProgram(program, true, false);
            });
        }
    }

    this.recalcChannelPositions(true);

    this.ctr.visible = true;

    this.nowIndicatorInterval = setInterval(function() {
        self.updateNowIndicator();
    }, 60000)
};

Guide.prototype.hide = function() {
    this.ctr.visible = false;
    clearInterval(this.nowIndicatorInterval);
};

Guide.prototype.selectProgram = function(program, immediate, scrollToProgram) {
    this.ctr.tag('active-border').visible = true;

    if (this.selectedProgram) {
        this.selectedProgram.deselect(immediate);
    }
    if (this.selectedProgram && this.selectedProgram.channel !== program.channel) {
        this.selectedProgram.channel.deselect(immediate);
    }

    if (!this.selectedProgram || this.selectedProgram.channel !== program.channel) {
        program.channel.select(immediate);

        // Channel positions also must be updated.
        this.recalcChannelPositions(immediate);
    }

    program.select(immediate);

    // Show active border at the correct position.
    var activeBorder = this.ctr.tag('active-border');
    activeBorder.x = program.ctr.x;
    activeBorder.y = program.timeWindow.channel.ctr.y + Guide.CHANNEL_SELECTED_HEIGHT - 4;
    activeBorder.w = program.ctr.w;

    this.selectedProgram = program;

    this.scrollToChannel(program.channel, immediate);

    if (scrollToProgram) {
        // Scroll to the program.
        this.scrollToProgram(program, immediate);
    }

    if (immediate) {
        this.updateArea();
    }

    if (immediate) {
        this.updateGuideInfo();
    } else {
        this.setUpdateGuideInfoTimeout();
    }
};

Guide.prototype.recalcChannelPositions = function(immediate) {
    var y = 0;
    for (var i = 0, n = this.channels.length; i < n; i++) {
        this.channels[i].labelCtr.y = y;
        this.channels[i].ctr.y = y;
        y += this.channels[i].labelCtr.h + Guide.BLACK_BORDER_WIDTH;

        if (immediate) {
            this.channels[i].labelCtr.fastForward('y');
            this.channels[i].ctr.fastForward('y');
        }
    }
};

Guide.prototype.setUpdateGuideInfoTimeout = function(){
    this.hideGuideInfoAnimation.play();
    if (this.updateGuideInfoTimeout) {
        clearTimeout(this.updateGuideInfoTimeout);
    }
    var self = this;
    this.updateGuideInfoTimeout = setTimeout(function() {
        self.updateGuideInfo();
    }, 500);
};

Guide.prototype.updateGuideInfo = function(){
    this.hideGuideInfoAnimation.stop();
    var program = this.selectedProgram;
    var guideTime = this.ctr.tag('guide-info-general-time');
    var guideDuration = this.ctr.tag('guide-info-general-duration');
    var genre = this.ctr.tag('guide-info-general-genre');
    var bulletOneCtr = this.ctr.tag('guide-info-general-bullet-1');
    var bulletTwoCtr = this.ctr.tag('guide-info-general-bullet-2');
    var ageCtr = this.ctr.tag('guide-info-general-age');
    var nowCtr = this.ctr.tag('guide-info-general-now');

    var duration = Math.round(program.getDuration() / 60000);
    var dh = Math.floor(duration/60);
    var dm = duration % 60;
    var dLabel = dh ? (dh +' uur '+ (dm>0?dm+' min':'')) : ((dm<10?'0'+dm:dm)+' min');

    if (program.o.video && program.o.video.imageLink) {
        this.ctr.tag('guide-info-image').src = null;
        this.ctr.tag('guide-info-image').src = program.o.video.imageLink.href;
    } else {
        this.ctr.tag('guide-info-image').src = null;
    }

    this.ctr.tag('guide-info-title').text = program.o.title || '';
    this.ctr.tag('guide-info-description').text = program.o.video.synopsis || '';
    guideTime.text = this.getTimeString(program.o.start);
    guideDuration.text = dLabel;
    genre.text = program.o.video.category || '';

    this.ctr.tag('guide-info-general').visible = true;
    guideTime.texture && guideTime.loadTexture();
    bulletOneCtr.x = guideTime.renderWidth + 10;
    guideDuration.x = bulletOneCtr.x + 16;
    guideDuration.texture && guideDuration.loadTexture();
    bulletTwoCtr.x =  guideDuration.x + guideDuration.texture.source.w + 10;
    genre.x = bulletTwoCtr.x + 16;
    genre.texture && genre.loadTexture();
    nowCtr.x = genre.x + genre.renderWidth + 12;
    nowCtr.texture && nowCtr.loadTexture();
    ageCtr.x = nowCtr.x + nowCtr.renderWidth + 12;

    if(nowCtr.visible == false) {
        ageCtr.x = nowCtr.x;
    }

    nowCtr.visible = (program.isRunningAt(getNowDate()));

    var ageRating = program.o.video.ageRating;
    if (ageRating !== undefined) {
        var icon = "";
        switch(ageRating) {
            case '6':
                icon = "d";
                break;
            case '9':
                icon = "g";
                break;
            case '12':
                icon = "j";
                break;
            case '16':
                icon = "n";
                break;
            case '18':
                icon = "p";
                break;
            default:
                console.log('unknown age rating:' + ageRating);
        }

        if (icon) {
            this.ctr.tag('guide-info-general-age').text = icon;
            this.ctr.tag('guide-info-general-age').visible = true;
        } else {
            this.ctr.tag('guide-info-general-age').visible = false;
        }
    } else {
        this.ctr.tag('guide-info-general-age').visible = false;
    }
};

Guide.prototype.updateGuideInfoLoading = function() {
    this.hideGuideInfoAnimation.stop();
    this.ctr.tag('guide-info-general').visible = false;
    this.ctr.tag('guide-info-title').text = "Loading..";
    this.ctr.tag('guide-info-description').text = "Please wait for the guide data to be loaded..";
    this.ctr.tag('guide-info-image').src = null;
    this.ctr.tag('guide-info-image').src = "./example.png";
};

Guide.prototype.getTimeString = function(date) {
    var minutes = date.getMinutes();
    var hours = date.getHours();
    var str = "";
    if (hours < 10) {
        str += "0";
    }
    str += hours + ":";
    if (minutes < 10) {
        str += "0";
    }
    str += minutes;
    return str;
};


// Returns the time window (chunks of 4h) which contains the specified date.
Guide.prototype.getTimeWindow = function(date) {
    date = new Date(date.getTime()); // Clone.

    date.setMinutes(0);
    date.setSeconds(0, 0);

    var hours = date.getHours();
    hours = ((hours / Guide.TIME_WINDOW_HOURS)|0)*Guide.TIME_WINDOW_HOURS;
    date.setHours(hours);
    return date;
};

// Focus on the specified channel.
Guide.prototype.scrollToChannel = function(channel, immediate) {
    var index = channel.index;

    var y = (index) * Guide.CHANNEL_HEIGHT - Guide.CHANNEL_HEIGHT * 3;

    // Correct y so that it shows no empty lines.
    y = Math.max(y, 0);
    y = Math.min(y, (this.channels.length - 1) * Guide.CHANNEL_HEIGHT + Guide.CHANNEL_SELECTED_HEIGHT - this.viewport.H);

    this.area.Y = -y;
    this.ctr.tag('guide-channels').Y = -y;

    if (immediate) {
        this.area.fastForward('y');
        this.ctr.tag('guide-channels').fastForward('y');
    }
};

Guide.prototype.scrollToProgram = function(program, immediate) {
    var d = new Date(program.o.start.getTime());
    this.scrollToPage(d, immediate);
};

Guide.prototype.scrollToPage = function(date, immediate) {
    // Get correct page (starting from 1970).
    var secsFrom1970 = date.getTime() * 0.001;
    secsFrom1970 -= secsFrom1970 % Guide.SECS_PER_SCROLL_PAGE;
    var date = new Date(secsFrom1970 * 1000);
    date.setSeconds(date.getSeconds() - Guide.SECS_SCROLL_PAGE_MIN_OFFSET);
    this.scrollToDate(date, immediate);
};

Guide.prototype.scrollToPageDelta = function(pages, immediate) {
    var date = this.getAreaScrollDate();
    date.setSeconds(date.getSeconds() + pages * Guide.SECS_PER_SCROLL_PAGE);
    this.scrollToDate(date, immediate);
};

// Focus on the specified date.
Guide.prototype.scrollToDate = function(date, immediate) {
    // Calculate new area scroll position.
    var timestamp = date.getTime() / 1000;
    this.area.X = -Math.floor((timestamp - this.baseSecs) * Guide.PIX_PER_SECOND);

    if (immediate) {
        this.area.fastForward('x');
    }
};

Guide.prototype.getAreaScrollDate = function() {
    // Get range of time. X = 0 means unix timestamp 0 (1970). Per extra pixel, add Guide.PIX_PER_SECOND seconds.
    var minTimestamp = Math.floor(-this.area.X / Guide.PIX_PER_SECOND) + this.baseSecs;
    return new Date(minTimestamp * 1000);
};

Guide.prototype.getAreaScrollEndDate = function() {
    var maxTimestamp = Math.floor((this.viewport.w - this.area.X) / Guide.PIX_PER_SECOND) + this.baseSecs;
    return new Date(maxTimestamp * 1000);
};

Guide.prototype.getAreaMinDate = function() {
    var minTimestamp = Math.floor(-this.area.x / Guide.PIX_PER_SECOND) + this.baseSecs;
    return new Date(minTimestamp * 1000);
};

Guide.prototype.getAreaMinChannel = function() {
    return Math.floor(-this.area.Y / Guide.CHANNEL_HEIGHT);
};

Guide.prototype.getAreaMaxChannel = function() {
    return Math.floor((this.viewport.h - this.area.Y) / Guide.CHANNEL_HEIGHT);
};

Guide.prototype.updateArea = function() {
    if (!this.area.x) return;

    var minY = Math.min(-this.area.Y, -this.area.y);
    var maxY = Math.max(-this.area.Y, -this.area.y) + this.viewport.h;

    var minX = Math.min(-this.area.X, -this.area.x);
    var maxX = Math.max(-this.area.X, -this.area.x) + this.viewport.w;

    // Get range of channels.
    var minChannelIndex = Math.floor(minY / Guide.CHANNEL_HEIGHT);
    var maxChannelIndex = Math.ceil(maxY / Guide.CHANNEL_HEIGHT);

    if (this.prevMinChannelIndex != -1) {
        var d = this.prevMinChannelIndex;
        while (d < minChannelIndex) {
            this.channels[d].ctr.visible = false;
            this.channels[d].labelCtr.visible = false;
            d++;
        }

        d = this.prevMaxChannelIndex;
        while (d > maxChannelIndex) {
            if (d < this.channels.length) {
                this.channels[d].ctr.visible = false;
                this.channels[d].labelCtr.visible = false;
            }
            d--;
        }
    }

    var minLoadChannel = this.getAreaMinChannel();
    var maxLoadChannel = this.getAreaMaxChannel();
    var minDate = new Date(1000 * ((minX / Guide.PIX_PER_SECOND) + this.baseSecs));
    var maxDate = new Date(1000 * ((maxX / Guide.PIX_PER_SECOND) + this.baseSecs));
    for (var index = minChannelIndex - 1; index <= maxChannelIndex; index++) {
        if (index < 0 || index >= this.channels.length) continue;
        this.channels[index].showRange(minDate, maxDate, (index >= minLoadChannel && index <= maxLoadChannel));
        this.channels[index].ctr.visible = (index < maxChannelIndex && index >= minChannelIndex);
        this.channels[index].labelCtr.visible = (index < maxChannelIndex && index >= minChannelIndex);
    }

    this.prevMinChannelIndex = minChannelIndex;
    this.prevMaxChannelIndex = maxChannelIndex;

    this.updateTimelineDay();
};

Guide.prototype.updateAreaLive = function() {
    var minChannelIndex = Math.floor(-this.area.y / Guide.CHANNEL_HEIGHT);
    var maxChannelIndex = Math.ceil((this.viewport.h - this.area.y) / Guide.CHANNEL_HEIGHT);

    var n = this.channels.length;
    for (var index = minChannelIndex - 1; index <= maxChannelIndex; index++) {
        if (index < 0 || index >= n) continue;
        this.channels[index].updateLeftProgram();
    }

    this.updateTimelines();
    this.updateNowIndicator();
};

Guide.prototype.updateTimelineDay = function() {
    var now = getNowDate();
    now.setHours(0, 0, 0, 0);

    var min = new Date(this.getAreaScrollDate());
    min.setHours(0, 0, 0, 0);

    var t;
    if (min.getTime() === now.getTime()) {
        t = 'Today';
    } else if (min.getTime() === now.getTime() + 1000 * 3600 * 24) {
        t = 'Tomorrow';
    } else if (min.getTime() === now.getTime() - 1000 * 3600 * 24) {
        t = 'Yesterday';
    } else {
        var t = '';
        switch(min.getDay()) {
            case 0: t = 'Sunday'; break;
            case 1: t = 'Monday'; break;
            case 2: t = 'Tuesday'; break;
            case 3: t = 'Wednesday'; break;
            case 4: t = 'Thursday'; break;
            case 5: t = 'Friday'; break;
            case 6: t = 'Saturday'; break;
        }
        t += ' ';
        var d = min.getDate();
        t += (d < 10 ? '0' : '') + d;
        var m = min.getMonth() + 1;
        t += '-' + (m < 10 ? '0' : '') + m;
    }
    this.ctr.tag('guide-date').text.text = '' + t;
};

Guide.prototype.updateTimelines = function() {
    var minDate = this.getAreaMinDate();
    var h = minDate.getHours();
    var m = minDate.getMinutes();
    var s = minDate.getSeconds();

    // Sync scrolling.
    var secs = (h * 60 + m) * 60 + s;
    this.ctr.tag('guide-time-lines').x = -Math.floor(secs * Guide.PIX_PER_SECOND);
};

Guide.prototype.updateNowIndicator = function() {
    var minDate = this.getAreaMinDate();
    var now = getNowDate();
    var x = Math.floor((now.getTime() - minDate.getTime()) * Guide.PIX_PER_SECOND * 0.001);
    if (x < 0) {
        this.ctr.tag('indicator-block').x = 240;
        this.ctr.tag('indicator-block').visible = false;
        this.ctr.tag('indicator').visible = false;
    } else {
        if (x < this.viewport.w + 200) {
            this.ctr.tag('indicator-block').x = 240 + x;
            this.ctr.tag('indicator-block').visible = true;
            this.ctr.tag('indicator').visible = true;
        } else {
            this.ctr.tag('indicator-block').visible = false;
        }
    }
};

Guide.prototype.handleKey = function(e) {
    switch(e.keyCode) {
        case Ui.KEYS.UP:
            this.up();
            break;
        case Ui.KEYS.DOWN:
            this.down();
            break;
        case Ui.KEYS.LEFT:
            this.left();
            break;
        case Ui.KEYS.RIGHT:
            this.right();
            break;
        case Ui.KEYS.ENTER:
            this.enter();
            break;
    }
};

Guide.prototype.left = function() {
    if (this.blocked || !this.selectedProgram) return;

    if (this.selectedProgram.o.start.getTime() > this.getAreaScrollDate().getTime()) {
        var np = this.selectedProgram.timeWindow.channel.getProgramStartingBefore(this.selectedProgram.o.start);
        if (np) {
            var currentSearchDate = new Date(this.searchDate.getTime());

            var newDate = this.selectedProgram.o.start;

            // Do not scroll backwards too much.
            currentSearchDate.setSeconds(currentSearchDate.getSeconds() - Guide.SECS_PER_SCROLL_PAGE);
            if (currentSearchDate.getTime() > newDate.getTime()) {
                // Scroll within program.
                this.searchDate = currentSearchDate;
                this.scrollToPage(currentSearchDate);
            } else {
                this.searchDate = new Date(Math.max(np.o.start.getTime(), currentSearchDate.getTime()));
                this.selectProgram(np, false, false);
                this.scrollToPage(this.searchDate);
            }
        }
    } else {
        this.scrollToPageDelta(-1);
        this.searchDate.setTime(this.searchDate.getTime() - 1000 * Guide.SECS_PER_SCROLL_PAGE);
    }
};

Guide.prototype.right = function() {
    if (this.blocked || !this.selectedProgram) return;

    if (this.selectedProgram.o.end.getTime() < this.getAreaScrollEndDate().getTime()) {
        var np = this.selectedProgram.timeWindow.channel.getProgramEndingAfter(this.selectedProgram.o.end);
        if (np) {
            this.searchDate = new Date(np.o.start.getTime());

            // If null then not loaded.
            this.selectProgram(np, false, true);
        }
    } else {
        this.scrollToPageDelta(1);
        this.searchDate.setTime(this.searchDate.getTime() + 1000 * Guide.SECS_PER_SCROLL_PAGE);
    }
};

Guide.prototype.up = function() {
    var channel = this.selectedProgram.channel;
    var index = this.channels.indexOf(channel);
    if (index > 0) {
        var np = this.channels[index - 1].getProgramRunningAt(this.searchDate);
        if (np) {
            this.selectProgram(np, false, false);
        }
    }
};

Guide.prototype.down = function() {
    var channel = this.selectedProgram.channel;
    var index = this.channels.indexOf(channel);
    if (index < this.channels.length - 1) {
        var np = this.channels[index + 1].getProgramRunningAt(this.searchDate);
        if (np) {
            this.selectProgram(np, false, false);
        }
    }
};

Guide.prototype.enter = function() {
    // Ignore.
};

var GuideChannel = function(guide, index, channel) {
    this.index = index;
    this.guide = guide;
    this.channel = channel;

    // Map from unix timestamp to TimeWindow object.
    this.timeWindows = new Map();

    // Contains all time window components.
    this.ctr = this.guide.stage.c({visible: false, children: [
        {tag: 'channel-clipper', clipping: true, x: -10e5, w: 20e5, y: Guide.BLACK_BORDER_WIDTH, h: Guide.CHANNEL_HEIGHT - Guide.BLACK_BORDER_WIDTH, children: [
            {tag: 'tw-container', x: 10e5, y: Guide.CHANNEL_INNER_SELECTED_OFFSET}
        ]}
    ]});

    this.twContainer = this.ctr.tag('tw-container');

    var channelName = this.channel.name;
    if( channelName.indexOf(' HD') >= 0){
        channelName = channelName.slice(0, -3);
    }

    var s = this.guide.stage;
    this.labelCtr = s.c({tag: 'channel', x: 0, w: 170, y: 0, h: Guide.CHANNEL_HEIGHT - Guide.BLACK_BORDER_WIDTH, borderWidthBottom: Guide.BLACK_BORDER_WIDTH, borderColor: 0xff515151, visible: false, children: [
        {tag: 'label-wrapper', children: [
            {tag: 'number', x: 10, y: 6, color: 0xffffffff, text: { text: (this.index + 1).toString(), fontSize: 20}},
            {tag: 'title', x: 160, mountX: 1, y: 6, color: 0xffffffff, text: {text: channelName, fontSize: 20, textAlign: "right", maxLines: 2, lineHeight: 21, wordWrapWidth: 100}}
        ]}
    ]});

    this.labelCtr.tag('title').loadTexture();
    if (this.labelCtr.tag('title').texture.source.renderInfo.lines.length > 1) {
        this.labelCtr.tag('title').y = 0;
    }

    this.prevMinTimeWindow = null;
    this.prevMaxTimeWindow = null;

    this.leftProgram = null;

    this.labelCtr.alpha = 0.5;
    this.ctr.alpha = 0.5;
    this.ctr.transition('alpha', {duration: Guide.CHANNEL_SELECTION_DURATION});
    this.labelCtr.transition('alpha', {duration: Guide.CHANNEL_SELECTION_DURATION});

    this.ctr.transition('y', {duration: Guide.CHANNEL_SELECTION_DURATION});
    this.labelCtr.transition('h', {duration: Guide.CHANNEL_SELECTION_DURATION});
    this.labelCtr.transition('y', {duration: Guide.CHANNEL_SELECTION_DURATION});

    this.ctr.tag('channel-clipper').transition('h', {duration: Guide.CHANNEL_SELECTION_DURATION});
    this.ctr.tag('tw-container').transition('y', {duration: Guide.CHANNEL_SELECTION_DURATION});

    this.labelCtr.tag('label-wrapper').transition('y', {duration: Guide.CHANNEL_SELECTION_DURATION});
};

GuideChannel.prototype.select = function(immediate) {
    // Show that program is no longer selected.
    this.ctr.alpha = 1;
    this.labelCtr.alpha = 1;

    this.labelCtr.h = Guide.CHANNEL_SELECTED_HEIGHT - Guide.BLACK_BORDER_WIDTH;

    this.ctr.tag('channel-clipper').h = Guide.CHANNEL_SELECTED_HEIGHT - Guide.BLACK_BORDER_WIDTH;
    this.ctr.tag('tw-container').y = 0;

    this.labelCtr.tag('label-wrapper').y = -Guide.CHANNEL_INNER_SELECTED_OFFSET;

    if (immediate) {
        this.labelCtr.tag('title').fastForward('color');
        this.labelCtr.tag('number').fastForward('color');
        this.labelCtr.fastForward('h');
        this.ctr.tag('channel-clipper').fastForward('h');
        this.ctr.tag('tw-container').fastForward('y');
        this.labelCtr.tag('label-wrapper').fastForward('y');
    }

};

GuideChannel.prototype.deselect = function(immediate) {
    // Show that program is no longer selected.
    this.ctr.alpha = 0.5;
    this.labelCtr.alpha = 0.5;

    this.labelCtr.h = Guide.CHANNEL_HEIGHT - Guide.BLACK_BORDER_WIDTH;

    this.ctr.tag('channel-clipper').h = Guide.CHANNEL_HEIGHT - Guide.BLACK_BORDER_WIDTH;
    this.ctr.tag('tw-container').y = Guide.CHANNEL_INNER_SELECTED_OFFSET;

    this.labelCtr.tag('label-wrapper').y = 0;

    if (immediate) {
        this.labelCtr.fastForward('alpha');
        this.ctr.fastForward('alpha');
        this.labelCtr.fastForward('h');
        this.ctr.tag('channel-clipper').fastForward('h');
        this.ctr.tag('tw-container').fastForward('y');
        this.labelCtr.tag('label-wrapper').fastForward('y');
    }

};

GuideChannel.prototype.showRange = function(minDate, maxDate, load) {
    var minTimeWindow = this.guide.getTimeWindow(minDate);
    var maxTimeWindow = this.guide.getTimeWindow(maxDate);

    if (this.prevMinTimeWindow != null) {
        var d = this.prevMinTimeWindow;
        while (d.getTime() < minTimeWindow.getTime()) {
            this.getTimeWindow(d).ctr.visible = false;
            d.setHours(d.getHours() + Guide.TIME_WINDOW_HOURS);
        }

        d = this.prevMaxTimeWindow;
        while (d.getTime() > maxTimeWindow.getTime()) {
            this.getTimeWindow(d).ctr.visible = false;
            d.setHours(d.getHours() - Guide.TIME_WINDOW_HOURS);
        }
    }

    // Make sure that all time windows in range exist.
    var cd = new Date(minTimeWindow.getTime());
    var scrollDate = this.guide.getAreaScrollDate();
    var scrollEndDate = this.guide.getAreaScrollEndDate();
    while (cd.getTime() <= maxTimeWindow.getTime()) {

        // Only create/load newly if the time window is visible in the current scroll page.
        if (this.timeWindows.has(cd.getTime()) || (load && ((cd.getTime() < scrollEndDate.getTime() && (cd.getTime() + Guide.TIME_WINDOW_HOURS * 3600 * 1000) >= scrollDate.getTime())))) {
            var timeWindow = this.getTimeWindow(cd);
            timeWindow.ctr.visible = true;
            timeWindow.showRange(minDate, maxDate);
        }

        cd.setHours(cd.getHours() + Guide.TIME_WINDOW_HOURS);
    }

    this.prevMinTimeWindow = minTimeWindow;
    this.prevMaxTimeWindow = maxTimeWindow;

    this.updateLeftProgram();
};

// Updates the partially visible leftmost visible program.
GuideChannel.prototype.updateLeftProgram = function() {
    var minDate = this.guide.getAreaMinDate();
    if (this.leftProgram) {
        if (!this.leftProgram.isRunningAt(minDate)) {
            // Reset.
            var title = this.leftProgram.titleCtr;
            title.x = 10;
            title.texture.disableClipping();
            title.visible = true;
            this.leftProgram = this.getProgramRunningAt(minDate);
        }
    } else {
        this.leftProgram = this.getProgramRunningAt(minDate);
    }

    if (this.leftProgram) {
        // Update.
        var x = (minDate.getTime() * 0.001 - this.guide.baseSecs) * Guide.PIX_PER_SECOND;
        var delta = x - this.leftProgram.ctr.x;

        var title = this.leftProgram.titleCtr;
        title.x = 10 + Math.max(0, delta);

        if (!title.texture.source.glTexture) {
            title.loadTexture();
        }

        var w = Math.min(this.leftProgram.ctr.w - 2 - title.x, title.texture.source.w);
        title.visible = (w >= 0);
        if (w > 0) {
            title.texture.enableClipping(0, 0, w, 0);
        }
    }
};

GuideChannel.prototype.getTimeWindow = function(date) {
    var ts = date.getTime() / 1000;
    if (!this.timeWindows.has(ts)) {
        var tw = new TimeWindow(this, new Date(date.getTime()));
        this.twContainer.addChild(tw.ctr);
        this.timeWindows.set(ts, tw);
        return tw;
    } else {
        return this.timeWindows.get(ts);
    }
};

GuideChannel.prototype.hasLoadedTimeWindow = function(date) {
    var ts = date.getTime() / 1000;
    return this.timeWindows.has(ts) && this.timeWindows.get(ts).loaded;
};

GuideChannel.prototype.loadTimeWindow = function(date, cb) {
    var tw = this.getTimeWindow(date);
    if (!tw.loaded) {
        tw.onload = cb;
    }
};

GuideChannel.prototype.removeTimeWindow = function(timeWindow) {
    this.timeWindows.delete(timeWindow.start.getTime() / 1000);
};

// Returns the program that starts latest before the specified date.
GuideChannel.prototype.getProgramStartingBefore = function(date) {
    var twDate = this.guide.getTimeWindow(new Date(date.getTime() - 1));
    if (!this.hasLoadedTimeWindow(twDate)) {
        return null;
    } else {
        var tw = this.getTimeWindow(twDate);
        var i, n = tw.programs.length;
        for (i = tw.programs.length - 1; i >= 0; i--) {
            if (tw.programs[i].o.start.getTime() < date.getTime()) {
                return tw.programs[i];
            }
        }
        return null;
    }
};

// Return the program that end soonest after the specified date.
GuideChannel.prototype.getProgramEndingAfter = function(date) {
    var twDate = this.guide.getTimeWindow(new Date(date.getTime() + 1));
    if (!this.hasLoadedTimeWindow(twDate)) {
        return null;
    } else {
        var tw = this.getTimeWindow(twDate);
        var i, n = tw.programs.length;
        for (i = 0; i < n; i++) {
            if (tw.programs[i].o.end.getTime() > date.getTime()) {
                return tw.programs[i];
            }
        }
        return null;
    }
};

GuideChannel.prototype.getProgramRunningAt = function(date) {
    var twDate = this.guide.getTimeWindow(date);
    if (!this.hasLoadedTimeWindow(twDate)) {
        return null;
    } else {
        var tw = this.getTimeWindow(twDate);
        var i, n = tw.programs.length;
        for (i = 0; i < n; i++) {
            if (tw.programs[i].isRunningAt(date)) {
                return tw.programs[i];
            }
        }
        return null;
    }
};

GuideChannel.prototype.resetTimeWindows = function() {
    this.twContainer.removeChildren();
    this.timeWindows.clear();
    this.leftProgram = null;
};

var TimeWindow = function(channel, date) {
    this.id = TimeWindow.id++;
    this.channel = channel;
    this.start = date;

    this.end = new Date(this.start.getTime());
    this.end.setHours(this.end.getHours() + Guide.TIME_WINDOW_HOURS);

    this.loaded = false;

    // Callback.
    this.onload = null;

    // Create container.
    this.ctr = channel.guide.stage.c({});

    // An array with all programs in this time window, ordered by time.
    this.programs = [];

    // Immediately try to load. Guide date will automatically appear.
    this.load();

};

TimeWindow.id = 0;

TimeWindow.prototype.showRange = function(minDate, maxDate) {
    var n = this.programs.length;
    if (n > 0 && this.programs[0].overlaps) {
        this.ctr.addChild(this.programs[0].ctr, 0);
    }
    if (n > 1 && this.programs[n - 1].overlaps) {
        this.ctr.addChild(this.programs[n - 1].ctr, 0);
    }

    for (var i = 0; i < n; i++) {
        this.programs[i].ctr.visible = (this.programs[i].isRunningBetween(minDate, maxDate));
    }
};

TimeWindow.prototype.load = function() {
    var self = this;

    this.channel.guide.getProgramsInRange(this.channel.channel, this.start, this.end, function(err, res) {
        if (err) {
            console.error(err);
            if (self.ctr.visible) {
                // Retry.
                setTimeout(function() {
                    self.load();
                }, 3000);
            } else {
                // Stop retrying and simply remove.
                self.channel.removeTimeWindow(self);
            }
            return;
        }

        var programs = res;

        if (!programs.length) {
            // Use dummy program record.
            var start = new Date(self.start.getTime());
            var end = new Date(self.end.getTime());
            var dummyProgram = new Program(self, {title: 'no information available', start: start, end: end, video: {synopsis: ''}});
            dummyProgram.dummy = true;
            self.programs = [dummyProgram];
            self.ctr.addChild(dummyProgram.ctr);
        } else {
            var i, n = programs.length;
            for (i = 0; i < n; i++) {
                var p, tw, overlaps = false;
                if (i == 0) {
                    // If the previous timezone already contains this program, copy it by reference.
                    if (programs[i].start.getTime() < self.start.getTime()) {
                        overlaps = true;
                        var prevTimeWindowDate = new Date(self.start.getTime());
                        prevTimeWindowDate.setHours(prevTimeWindowDate.getHours() - Guide.TIME_WINDOW_HOURS);
                        if (self.channel.hasLoadedTimeWindow(prevTimeWindowDate)) {
                            tw = self.channel.getTimeWindow(prevTimeWindowDate);
                            self.programs.push(tw.programs[tw.programs.length - 1]);
                            continue;
                        }
                    }
                }

                if (i == n - 1) {
                    // If the next timezone already contains this program, copy it by reference.
                    if (programs[i].end.getTime() >= self.end.getTime()) {
                        overlaps = true;
                        if (self.channel.hasLoadedTimeWindow(self.end)) {
                            tw = self.channel.getTimeWindow(self.end);
                            self.programs.push(tw.programs[0]);
                            continue;
                        }
                    }
                }

                p = new Program(self, programs[i]);
                p.overlaps = overlaps;
                self.programs.push(p);
                self.ctr.addChild(p.ctr);
            }
        }

        self.loaded = true;

        if (self.onload) self.onload();

        self.channel.guide.updateArea();
    });
};

var Program = function(timeWindow, o) {

    this.timeWindow = timeWindow;

    this.channel = timeWindow.channel;

    // Zapper object.
    this.o = o;

    // A dummy program is just there for show (no program data available) and has not detailed information.
    this.dummy = false;

    // If true, this program spans multiple time windows.
    this.overlaps = false;

    var stage = timeWindow.channel.guide.stage;

    // Dimensions.
    var x = Guide.PIX_PER_SECOND * (0.001 * this.o.start.getTime() - this.channel.guide.baseSecs);
    var w = 0.001 * Guide.PIX_PER_SECOND * (this.o.end.getTime() - this.o.start.getTime());

    // Make sure that the text doesn't look blurry but spacing is still ok.
    var nextX = x + w;
    x = Math.floor(x);
    w = Math.floor(nextX) - x;

    w -= 2;
    // Create component for program object (title, etc).
    // By default set newly loaded program to visible to prevent them from not being shown.
    this.ctr = stage.c({x: x, w: w, h: Guide.CHANNEL_SELECTED_HEIGHT, rect: true, color: 0xff515151, visible: true, children: [
        {x: 10, y: 6, color: 0xffffffff, text: {text: this.o.title || "-", fontSize: 19, wordWrap: false, cutEx: w - 12}}
    ]});

    this.titleCtr = this.ctr.children[0];

    if (w - 12 <= 0) {
        this.titleCtr.visible = false;
    }

};

Program.prototype.select = function(immediate) {
    this.ctr.color = 0xff717171;
};

Program.prototype.deselect = function(immediate) {
    this.ctr.color = 0xff515151;
};

Program.prototype.isRunningAt = function(date) {
    return this.o.start.getTime() <= date.getTime() && this.o.end.getTime() > date.getTime();
};

Program.prototype.isRunningBetween = function(start, end) {
    return this.o.start.getTime() <= end.getTime() && this.o.end.getTime() > start.getTime();
};

Program.prototype.getDuration = function() {
    return this.o.end.getTime() - this.o.start.getTime();
};

// The number of pixels that is shown for one second in the guide area.
Guide.PIX_PER_SECOND = 0.05;

// Height for channel bar.
Guide.CHANNEL_HEIGHT = 33;

// Height for selected channel bar.
Guide.CHANNEL_SELECTED_HEIGHT = 38;

Guide.CHANNEL_INNER_SELECTED_OFFSET = 0.5 * (Guide.CHANNEL_HEIGHT - Guide.CHANNEL_SELECTED_HEIGHT);

// Black bottom border width.
Guide.BLACK_BORDER_WIDTH = 3;

// Time window size.
Guide.TIME_WINDOW_HOURS = 4;

// The scrolling size.
Guide.SECS_PER_SCROLL_PAGE = (0.2 / Guide.PIX_PER_SECOND) * 3600;

Guide.SECS_SCROLL_PAGE_MIN_OFFSET = 60 * 10;

Guide.VIEWPORT_HEIGHT = 14 * Guide.CHANNEL_HEIGHT + Guide.CHANNEL_SELECTED_HEIGHT;

Guide.CHANNEL_SELECTION_DURATION = 0.15;