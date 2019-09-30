(function() {
    var locations = ['Caerleon', 'Bridgewatch', 'Fort Sterling', 'Lymhurst', 'Martlock', 'Thetford'];
    var items = [
        // https://github.com/broderickhyman/ao-bin-dumps/blob/master/formatted/items.txt
        'T2_ORE', 'T3_ORE', 'T4_ORE', 'T5_ORE', 'T6_ORE', 'T7_ORE', 'T8_ORE',
        'T2_FIBER', 'T3_FIBER', 'T4_FIBER', 'T5_FIBER', 'T6_FIBER', 'T7_FIBER', 'T8_FIBER',
        'T1_ROCK', 'T2_ROCK', 'T3_ROCK', 'T4_ROCK', 'T5_ROCK', 'T6_ROCK', 'T7_ROCK', 'T8_ROCK',
        'T1_WOOD', 'T2_WOOD', 'T3_WOOD', 'T4_WOOD', 'T5_WOOD', 'T6_WOOD', 'T7_WOOD', 'T8_WOOD',
        'T1_HIDE', 'T2_HIDE', 'T3_HIDE', 'H4_HIDE', 'T5_HIDE', 'T6_HIDE', 'T7_HIDE', 'T8_HIDE'
    ];
    var itemNames = [
        'Coppper Ore', 'Tin Ore', 'Iron Ore', 'Titanium Ore', 'Runite Ore', 'Meteorite Ore', 'Adamantium Ore',
        'Cotton', 'Flax', 'Hemp', 'Skyflower', 'Redleaf Cotton', 'Sunflax', 'Ghost hemp',
        'Rough Stone', 'Limestone', 'Sandstone', 'Travertine', 'Granite', 'Slate', 'Basalt', 'Marble',
        'Rough Logs', 'Birch Logs', 'Chestnut Logs', 'Pine Logs', 'CedarLogs', 'Bloodoak Logs', 'Ashenbark Logs', 'Whitewood Logs',
        'Scraps of Hide', 'Rugged Hide', 'Thin Hide', 'Medium Hide', 'Heavy Hide', 'Robust Hide', 'Thick hide', 'Resilient Hide'
    ];
    var medianPrices = {};
    
    $(document).ready(function() {
        function populateSelect(id) {
            var select = $(id).empty();
            $.each(itemNames, function(index) {
                var itemName = itemNames[index];
                select.append($('<option></option>').attr('value', index).text(itemName))
            });
        }
        populateSelect('#item1');
        populateSelect('#item2');

        $('#convertBtn').prop('disabled', true);
    });
    
    $.ajax('https://www.albion-online-data.com/api/v2/stats/prices/' + items.join(',') + '?locations=' + locations.join(','), {})
        .done(function(data) {
            function cityToObject(city) {
                var items = data.filter(function(obj) { return obj.city === city; });
                var obj = {};
                items.forEach(function(item) {
                    obj[item.item_id] = item.sell_price_min;
                });
                return obj;
            }

            var cityItems = locations.map(function(location) { return cityToObject(location); });
            items.forEach(function(itemId) {
                function median(arr) {
                    var sortedArr = arr.sort();
                    if (sortedArr.length % 2 == 1) {
                        return sortedArr[Math.floor(sortedArr.length / 2)];
                    }
                    return (sortedArr[Math.floor(sortedArr.length / 2)] + sortedArr[Math.ceil(sortedArr.length / 2)]) / 2;
                }

                var itemPrices = cityItems.map(function(cityItem) { return cityItem[itemId]; });
                var medianPrice = median(itemPrices);
                medianPrices[itemId] = medianPrice;
            });
            
            $(document).ready(function() {
                $('#convertBtn').prop('disabled', false);
                $('#convertBtn').click(function() {
                    function prettify(num) {
                        return Math.round(num * 100) / 100;
                    }

                    var item1Units = $('#item1Units').val();
                    var item1Index = $('#item1').val();
                    var item2Index = $('#item2').val();
                    var item1Id = items[item1Index];
                    var item2Id = items[item2Index];
                    var item1Name = itemNames[item1Index];
                    var item2Name = itemNames[item2Index];
                    var item1Price = medianPrices[item1Id];
                    var item2Price = medianPrices[item2Id];

                    $('#output1').text('1 ' + item2Name + ' = ' + prettify(item2Price / item1Price) + ' ' + item1Name);
                    if (item1Units) {
                        $('#output2').text(item1Units + ' ' + item1Name + ' = ' + prettify(Number(item1Units) * (item1Price / item2Price)) + ' ' + item2Name);
                    } else {
                        $('#output2').text('');
                    }
                });
            });
        });
}());
