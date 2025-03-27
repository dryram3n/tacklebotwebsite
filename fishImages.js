// Fish image mappings 
const FISH_IMAGES = {
    "Common Carp": "https://cdn.discordapp.com/attachments/1349726808488153168/1349728486880710666/Carp.png?ex=67d4281c&is=67d2d69c&hm=a080decf34c81199424c78c1af8ad50db2e9b6d26e76d5c5bfe27fbdeca7f48e&",
    "Dark Carp": "https://cdn.discordapp.com/attachments/1349726808488153168/1349730628849111113/Dark_Carp.png?ex=67d42a1a&is=67d2d89a&hm=c36368afd2f1d8fee01da4f2f285d1d02a17a892c29bb2def5009e004972c462&",
    "Minnow": "https://cdn.discordapp.com/attachments/1349726808488153168/1349731080336576533/Minnow.png?ex=67d42a86&is=67d2d906&hm=0a1766227be1f6cc7d05a8c717099cc0cfa9dde13415330625dd9a90026fb6fe&",
    "Dark Minnow": "https://cdn.discordapp.com/attachments/1349726808488153168/1349731427566092410/Dark_Minnow.png?ex=67d42ad9&is=67d2d959&hm=30d87521ce66357c5574aa3eb0909a5bf1ca796310916cd8b5a76504b27c893f&",
    "Sardine": "https://cdn.discordapp.com/attachments/1349726808488153168/1349731765916532869/Sardine.png?ex=67d42b29&is=67d2d9a9&hm=eb9a7a017be954c0dc13b847210806b30b2b786a0a7eb004d0b49ed30970f912&",
    "Hungry Sardine": "https://cdn.discordapp.com/attachments/1349726808488153168/1349732072159182848/hungry_sardine.png?ex=67d42b72&is=67d2d9f2&hm=d8cc64ee5049f3b1c634791f2adab19b868c4734e8b712245200451eb8a3eff4&",
    "Sunfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1349732391232733184/Sunfish.png?ex=67d42bbe&is=67d2da3e&hm=080021fc218eb5167e2c700e063d36c5b38ebdec149e8ab856e0d8136eac6c5a&",
    "Bluegill": "https://cdn.discordapp.com/attachments/1349726808488153168/1349732637329326100/Bluegill.png?ex=67d42bf9&is=67d2da79&hm=fe519d59fa4feca41a2b9139cc89233be2d9dbca712bf3d1ceff838e22c07467&",
    "Perch": "https://cdn.discordapp.com/attachments/1349726808488153168/1349733037864390666/Perch.png?ex=67d42c59&is=67d2dad9&hm=5105260125480a89d4d3fde927acfc878fe53d167caa5154a0e3e922be665fc7&",
    "Anchovy": "https://cdn.discordapp.com/attachments/1349726808488153168/1349733835809751202/Anchovy.png?ex=67d42d17&is=67d2db97&hm=8aa8d95f1f3e859bd476f3ce7dbfe72fbf570a0e7e9686c3b93e4772d79d6b66&",
    "Mal Anchovy": "https://cdn.discordapp.com/attachments/1349726808488153168/1349942781644111933/Mal-Anchovy.png?ex=67d4efaf&is=67d39e2f&hm=cbe0c709253e6255f1e7970a0943d63285e4238d5e8b29e3bcdaa2b91f368778&",
    "Blobfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1349943654978027637/Blobfish.png?ex=67d4f080&is=67d39f00&hm=a599407ad2bf51043cdf8f43f09f529906c792201d46f6c47813372bda9cf05f&",

    // Uncommon fish

    "Bass": "https://cdn.discordapp.com/attachments/1349726808488153168/1349944810118582292/Bass.png?ex=67d4f193&is=67d3a013&hm=b84f35f0e7bb07f79b5b5b0bf49469ce7ff7c151fbfbb05a0a922ba4bfcb4369&",
    "Rainbow Trout": "https://cdn.discordapp.com/attachments/1349726808488153168/1349944397772619856/Rainbow_Trout.png?ex=67d4f131&is=67d39fb1&hm=3a75ff453ff7e2f510e6f8f483ae959fa5af1fdbea14f949780f82632779225d&",
    "Catfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1349945359299903541/Catfish.png?ex=67d4f216&is=67d3a096&hm=96b0d91a4d324a5e3e0ff1837fb9e379efea734a915f1471a19fe558c5300f48&",
    "Mackeral": "https://cdn.discordapp.com/attachments/1349726808488153168/1349945578053959832/Mackeral.png?ex=67d4f24a&is=67d3a0ca&hm=928e237546a4b315999d0b5bae89b9f8208a2559639d29846fedb9bea497fb17&",
    "Pike": "https://cdn.discordapp.com/attachments/1349726808488153168/1349945761944698942/Pike.png?ex=67d4f276&is=67d3a0f6&hm=c1cde4f1409c493b7a90f8a6c3fa80a2825938f722cac5d017aba0ba285eab33&",
    "Snapper": "https://cdn.discordapp.com/attachments/1349726808488153168/1349946453723975832/Snapper.png?ex=67d4f31b&is=67d3a19b&hm=12789b9e949e431b81077f5ff9ab79cb57277dd7b68cf6658f6693e1e53943aa&",
    "Crappie": "https://cdn.discordapp.com/attachments/1349726808488153168/1349948131642707978/Crappie.png?ex=67d4f4ab&is=67d3a32b&hm=7a6a5734a5da4a5adb0741d40b7e9066877b731a083153c1192a8bae566b1fb2&",
    "Luminous Eel": "https://cdn.discordapp.com/attachments/1349726808488153168/1349948577182515325/Luminous_Eel.png?ex=67d4f515&is=67d3a395&hm=6df59153539a596e782199fe0f3e8941fc65324393cc1486522eac0a42236cca&",
    "Alluring Mermaid": "https://cdn.discordapp.com/attachments/1349726808488153168/1349951311218737152/Alluring_Mermaid.png?ex=67d4f7a1&is=67d3a621&hm=57f569dda0db1320fb34b6c57a5d57dceb5c4c8d73af9afb9cec69d36123a1b3&",
    "Transparant Shark": "https://cdn.discordapp.com/attachments/1349726808488153168/1349952756693336104/Transparent_Shark.png?ex=67d4f8fa&is=67d3a77a&hm=a4bc9de6943e4b1ef49d2486def803622f4a8a0d74f6321e21ebfa9beb66f62e&",

    // Rare fish

    "Salmon": "https://cdn.discordapp.com/attachments/1349726808488153168/1349952847231324180/Salmon.png?ex=67d4f90f&is=67d3a78f&hm=99b9ccc950f4e3c7d31cbc4b1610a5dee5d2b3cc8cec883055bc15aa47f64b60&",
    "Tuna": "https://cdn.discordapp.com/attachments/1349726808488153168/1349953348161507412/Tuna.png?ex=67d4f987&is=67d3a807&hm=b11342220aceefd14862088ada88c1a155559c8be81fdcf4534fe3813dc4591a&",
    "Swordfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1349953616852811876/Swordfish.png?ex=67d4f9c7&is=67d3a847&hm=8836e1aedf0ad1e38008f90fd06d729d2003d5a2bbefd0da7c1dd03110cac0e9&",
    "Barracuda": "https://cdn.discordapp.com/attachments/1349726808488153168/1349954104268689448/Barracuda.png?ex=67d4fa3b&is=67d3a8bb&hm=2d3a86811215b72acb586b0092e952943c9cb09eec81e551978b1b8d91af8509&",
    "Piranha": "https://cdn.discordapp.com/attachments/1349726808488153168/1349954365967958047/Piranha.png?ex=67d4fa79&is=67d3a8f9&hm=f0fed9badc1f5c8b2be6530c5b562d35f246eda604f268c00cb3b65504f6d130&",
    "Pufferfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1349954636546703360/Pufferfish.png?ex=67d4faba&is=67d3a93a&hm=b284037edd8bbd56f534a49afd9e45b420fd1ea952ff18aa7468a438601e715d&",
    "Mahi Mahi": "https://cdn.discordapp.com/attachments/1349726808488153168/1349954835482542141/Mahi-Mahi.png?ex=67d4fae9&is=67d3a969&hm=a36d4022b53f23e452b9a71c4c6fb562ccd0f83cf55c27d03d5b12dd6debc8bf&",
    "Giant Sturgeon": "https://cdn.discordapp.com/attachments/1349726808488153168/1349997559766319144/Giant_Sturgeon.png?ex=67d522b3&is=67d3d133&hm=81d0b49a93922285bef76d9aa2948eab4cc94ce9123376f9ac3c087066f3d6ad&",
    "Electric Ray": "https://cdn.discordapp.com/attachments/1349726808488153168/1349997754587549748/Electric_Ray.png?ex=67d522e2&is=67d3d162&hm=b05e65d3d15666950d0cbca82d9bbc4ecfc9e6cff6e56af8cbc09d363dd19810&",
    "Crystal Carp": "https://cdn.discordapp.com/attachments/1349726808488153168/1349997939690569808/Crystal_Carp.png?ex=67d5230e&is=67d3d18e&hm=7747835a154de4f478046a6fc8a28520eee4f2fb0dbd5293c7fb2c91a82d4860&",
    "Crawfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1349998151863504927/Crawfish.png?ex=67d52341&is=67d3d1c1&hm=52b9fe2a36009e52f4211a41a59621f0348aec094a33022f1d4ae491583f8d76&",
    "Snail": "https://cdn.discordapp.com/attachments/1349726808488153168/1349998314506162278/Snail.png?ex=67d52367&is=67d3d1e7&hm=e8aec5c6350357b6744dc569eca1f6562c452f1cf90eabd5181e5394ea3fbf1e&",

    // Legendary fish

    "Golden Koi": "https://cdn.discordapp.com/attachments/1349726808488153168/1349998640172630047/Golden_Koi_Fish.png?ex=67d523b5&is=67d3d235&hm=66657dfe56d622fd1b83299c1c1d23ac9202303ef5c651450c2aba6d2894e9d6&",
    "Gar": "https://cdn.discordapp.com/attachments/1349726808488153168/1349999984120037416/Gar.png?ex=67d524f6&is=67d3d376&hm=02888fd2eb63f1b7336b6a5cf759c07ca3478df18d77a1a2db8a02dd451a9dbb&",
    "Giant Catfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350000250474991627/Giant_Catfish.png?ex=67d52535&is=67d3d3b5&hm=14b84df54b960b475e8dc1a3f995a50285d69b6a56742092370a3637eb88a0af&",
    "Fish O Legend": "https://cdn.discordapp.com/attachments/1349726808488153168/1350000628776042566/Fish-O-Legend.png?ex=67d5258f&is=67d3d40f&hm=cb93933b4d1f5f2daaacc44e2e8944aa02243bce783e0df4aafdcd3b0ffa806d&",
    "Ancient Dragon Fish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350001531465891860/Ancient_Dragon_Fish.png?ex=67d52666&is=67d3d4e6&hm=58b41428fb80eb2cc2a5b2e721ba7b6f1d14477fd45f24333480fc52df3f30d3&",
    "Anglerfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350002638728593450/Anglerfish.png?ex=67d5276e&is=67d3d5ee&hm=597758598205e151df0ef3497de538327f96c0bf522bee6447c572893177cada&",
    "Ghostly Eel": "https://cdn.discordapp.com/attachments/1349726808488153168/1350002911878451230/Ghostly_Eel.png?ex=67d527b0&is=67d3d630&hm=11f1964dec969e8e8ed7930d04bcd3e1d61226e822f5ea7c853fbe036a794bd0&",
    "Diamond Bass": "https://cdn.discordapp.com/attachments/1349726808488153168/1350003099334344775/Diamond_Bass.png?ex=67d527dc&is=67d3d65c&hm=6f9c2e6b4f6f2b905d99c9208ca98b1c3e38754948a23f09eb2da0931191293a&",
    "Prismatic Shark": "https://cdn.discordapp.com/attachments/1349726808488153168/1350003539442667623/Prismatic_Shark.png?ex=67d52845&is=67d3d6c5&hm=5469150965847dd36aea3df203d3e44d1c7621590d0928d0bb88e82ba3406ad5&",
    "Obsidian Marlin": "https://cdn.discordapp.com/attachments/1349726808488153168/1350003938274840647/Obsidian_Marlin.png?ex=67d528a4&is=67d3d724&hm=17b36812cc4a701525f3f6745623128e5166d736bb1638b669f140f5c7bca398&",
    "Gilded Coelacanth": "https://cdn.discordapp.com/attachments/1349726808488153168/1350004345143427115/Gilded_Coelacanth.png?ex=67d52905&is=67d3d785&hm=e2ae79f07d0d52cbe00bd1ca454d2b44644b49f0cc73805a5e4292c537e2dab7&",
    "Ethereal Seahorse": "https://cdn.discordapp.com/attachments/1349726808488153168/1350004557794508843/Ethereal_Seahorse.png?ex=67d52938&is=67d3d7b8&hm=f2f4ccb902d20006de8bc9d3c1c0116e074216181ee565c756c959785aa79529&",

    // Mythic fish

    "Kraken": "https://cdn.discordapp.com/attachments/1349726808488153168/1350005498828558366/Kraken.png?ex=67d52a18&is=67d3d898&hm=1563e873d07493e2d6d050a8c5c5521902ca3eb620002c7a5f3badc4ca99975e&",
    "Rainbow Shark": "https://cdn.discordapp.com/attachments/1349726808488153168/1350005782766288966/Rainbow_Shark.png?ex=67d52a5c&is=67d3d8dc&hm=bccb9dd853d396b8a4baa2b8bcd1933650e9a80bd0385c88b4433944cd84520f&",
    "Celestial Whale": "https://cdn.discordapp.com/attachments/1349726808488153168/1350006086354337853/Celestial_Whale.png?ex=67d52aa4&is=67d3d924&hm=37170bd05920ebbf7442c59a64cb9d78bb94e5d1810eb05ab4eac88b64b503e1&",
    "Starlight Jellyfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350006899126567006/Starlight_Jellyfish.png?ex=67d52b66&is=67d3d9e6&hm=9bff28dd2523f72a510ec47e27ff94caa4f63fb55e71c871dd7b1f784f4abda5&",
    "Phoenix Fish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350007721985835049/Phoenix_Fish.png?ex=67d52c2a&is=67d3daaa&hm=a1922ad5abc1862c94f8630a0cd08bbfd61feec21f6aa746f83b67d92bbac0e7&",
    "Galactic Ray": "https://cdn.discordapp.com/attachments/1349726808488153168/1350007971479818290/Galactic_Ray.png?ex=67d52c66&is=67d3dae6&hm=983676e6fcafd441e65fef00166c6a2046b22b00952109a5dd04c8fdf1bec167&",
    "Void Leviathan": "https://cdn.discordapp.com/attachments/1349726808488153168/1350008949570666506/Void_Leviathan.png?ex=67d52d4f&is=67d3dbcf&hm=3f4875c3c1fd43cabe0967cc3f76525e996f0bf0e543f4f6800f0c8065e24b3d&",
    "Benihana HotFish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350010083819520012/Benihana_HotFish.png?ex=67d52e5d&is=67d3dcdd&hm=b0f3ae71bd3edcdc5fb851c57dca41bd904db9de3a48e71ff698d5dd17c56dee&",
    "NO NAME": "https://cdn.discordapp.com/attachments/1349726808488153168/1350010985917710379/NO_NAME.png?ex=67d52f35&is=67d3ddb5&hm=acd329d2e95c81044e664b57f5e06361484c1799f70f5225f70475c2c8f30c41&",
    "Aesthetic Spartan on a Fish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350012590691979337/Aesthetic_Spartan_on_a_Fish.png?ex=67d530b3&is=67d3df33&hm=c54c8e4a80475e9636fc6f828c2ed4705279ec446ca63ec5d0fa5675879ba799&",
    "Goldie": "https://cdn.discordapp.com/attachments/1349726808488153168/1350013569038553098/Goldie.png?ex=67d5319c&is=67d3e01c&hm=60dfa93476bad1b8cdebf418ecc9c61b170bba3296133bfc6e3764390e168cc7&",
    "Ribbity": "https://cdn.discordapp.com/attachments/1349726808488153168/1350013947222298644/Ribbity.png?ex=67d531f7&is=67d3e077&hm=4736862e24a14292e2d08c26dec390ff2c7e0c06461a626646178aea07f4cabd&",
    "Stained Glass Fish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350014296360357888/Stained_Glass_Fish.png?ex=67d5324a&is=67d3e0ca&hm=6d57275e541f62971475687c906d6159f689ae68c41db1de9790df431226739d&",

    // Chimerical fish

    "Dimensional Leviathan": "https://cdn.discordapp.com/attachments/1349726808488153168/1350014875434483742/Dimensional_Leviathan.png?ex=67d532d4&is=67d3e154&hm=fbdc3734ee5864878907761a575b633420ff28ddc75c1f06e3afcc6c2c9a801b&",
    "Paradox Whale": "https://cdn.discordapp.com/attachments/1349726808488153168/1350015092464418826/Paradox_Whale.png?ex=67d53308&is=67d3e188&hm=79d3bb464db161c43095ce5f745f4de2821e3d49999fa110ab91833925fa96d4&",
    "Quantum Kraken": "https://cdn.discordapp.com/attachments/1349726808488153168/1350015375277822013/Quantum_Kraken.png?ex=67d5334b&is=67d3e1cb&hm=1cf45aa63bc1c52dcd1cec7fb8ff387d54d684182c214c607a702d5dd435dd5f&",
    "Reality Ripper": "https://cdn.discordapp.com/attachments/1349726808488153168/1350015566764707892/Reality_Ripper.png?ex=67d53379&is=67d3e1f9&hm=d8d8ff24d938313905496c648dde68479c223cc2b6c68843ceed9d80a584a12d&",
    "Time Serpent": "https://cdn.discordapp.com/attachments/1349726808488153168/1350015775892574278/Time_Serpent.png?ex=67d533ab&is=67d3e22b&hm=ed7344369e7beef204791897540142b99e3f8547440975530432207b95069c91&",
    "Cosmic Angler": "https://cdn.discordapp.com/attachments/1349726808488153168/1350015943874445313/Cosmic_Angler.png?ex=67d533d3&is=67d3e253&hm=d05d5d1449e884f40b4f658fffeafc202f2b1736a5d14d7a5419f67974bd3aad&",
    "Void Maw": "https://cdn.discordapp.com/attachments/1349726808488153168/1350016124171059252/Void_Maw.png?ex=67d533fe&is=67d3e27e&hm=312b2ebcb8bb65ab176633519f53ae3309c77929eca4fa1eb5f72eaa341fd204&",
    "Star Devourer": "https://cdn.discordapp.com/attachments/1349726808488153168/1350016299270410300/Star_Devourer.png?ex=67d53427&is=67d3e2a7&hm=46f1114f0aaafab3de07f1688d0377b73296a86d44c0debdde49ad02e6db9f1d&",
    "Goatfish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350016850918113290/Goatfish.png?ex=67d534ab&is=67d3e32b&hm=cd09444b09048a1cb444f7b07a5bb72ba27fddc686826f9f54df3f5597e0e93f&",
    "Goldie X": "https://cdn.discordapp.com/attachments/1349726808488153168/1350017045726498817/Goldie_X.png?ex=67d534d9&is=67d3e359&hm=e6e063990ae0878cdeff144130a5914e306529d82e107d247bab0d49083fca8c&",
    "Frogo": "https://cdn.discordapp.com/attachments/1349726808488153168/1350017275545255957/Frogo.png?ex=67d53510&is=67d3e390&hm=47bc6778bb8970b5020ca507abfb4f5787b1d4fd473959ddb53cb72ee9d87882&",
    "Toxic Sludge Fish": "https://cdn.discordapp.com/attachments/1349726808488153168/1350017626243465277/Toxic_Sludge_Fish.png?ex=67d53564&is=67d3e3e4&hm=2b0a869e5ae424ee07771bd1faf480f4f4d32270a0ae3812b4a9f8c7788b393c&",
};