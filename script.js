var cityDistances = {
  Jakarta: 528,
  Surabaya: 1305,
  Bandung: 673,
  Medan: 1364,
  Semarang: 964,
  Lampung: 240,
  Bali: 1703,
  Jambi: 277,
  Aceh: 1803

};

function addItemInputs() {
  var numItems = parseInt(document.getElementById('numItems').value);
  var itemsContainer = document.getElementById('itemsContainer');
  itemsContainer.innerHTML = '';

  for (var i = 1; i <= numItems; i++) {
    var citySelect = document.createElement('select');
    citySelect.id = 'city' + i;
    for (var city in cityDistances) {
      var option = document.createElement('option');
      option.value = cityDistances[city];
      option.text = city;
      citySelect.appendChild(option);
    }

    var weightInput = document.createElement('input');
    weightInput.type = 'number';
    weightInput.placeholder = 'Masukkan berat barang ke-' + i + ' (kg)';

    itemsContainer.appendChild(citySelect);
    itemsContainer.appendChild(weightInput);
    itemsContainer.appendChild(document.createElement('br'));
  }
}

function calculateDeliveryOptions() {
  var numItems = parseInt(document.getElementById('numItems').value);
  var distances = [];
  var weights = [];

  for (var i = 0; i < numItems; i++) {
    var citySelect = document.getElementById('itemsContainer').children[i * 3];
    var weightInput = document.getElementById('itemsContainer').children[i * 3 + 1];

    distances.push(parseFloat(citySelect.value));
    weights.push(parseFloat(weightInput.value));
  }

  var budget = parseFloat(document.getElementById('budget').value);

  var deliveryOptions = [
    { name: 'Pengiriman Reguler', costPerKM: 3500, costPerKG: 2000 },
    { name: 'Pengiriman Cepat', costPerKM: 5000, costPerKG: 4000 },
    { name: 'Pengiriman Kilat', costPerKM: 8000, costPerKG: 6000 }
  ];

  var numDeliveries = distances.length;
  var totalCost = 0;
  var selectedItems = [];
  var isMinCostSelected = document.getElementById('minCostSelected').value === 'true';
  var greedyVariant = document.getElementById('greedyVariant').value;

  // Menghitung biaya pengiriman untuk setiap barang dengan setiap opsi pengiriman
  for (var i = 0; i < numDeliveries; i++) {
    var item = { distance: distances[i], weight: weights[i] };
    var itemCosts = [];

    for (var j = 0; j < deliveryOptions.length; j++) {
      var cost =
        deliveryOptions[j].costPerKM * item.distance +
        deliveryOptions[j].costPerKG * item.weight;
      itemCosts.push(cost);
    }

    var selectedItemIndex;
    if (greedyVariant === 'weight') {
      selectedItemIndex = isMinCostSelected ? itemCosts.indexOf(Math.min.apply(null, itemCosts)) : itemCosts.indexOf(Math.max.apply(null, itemCosts));
    } else if (greedyVariant === 'distance') {
      selectedItemIndex = isMinCostSelected ? itemCosts.indexOf(Math.min.apply(null, itemCosts)) : itemCosts.indexOf(Math.max.apply(null, itemCosts));
    } else if (greedyVariant === 'density') {
      var densities = itemCosts.map(function (cost, index) {
        return cost / (distances[index] * weights[index]);
      });
      selectedItemIndex = isMinCostSelected ? densities.indexOf(Math.min.apply(null, densities)) : densities.indexOf(Math.max.apply(null, densities));
    } else {
      selectedItemIndex = isMinCostSelected ? itemCosts.indexOf(Math.min.apply(null, itemCosts)) : itemCosts.indexOf(Math.max.apply(null, itemCosts));
    }

    item.deliveryOption = deliveryOptions[selectedItemIndex];
    selectedItems.push(item);
  }

  // Mengurutkan barang-barang berdasarkan biaya pengiriman terendah
  selectedItems.sort(function (a, b) {
    var costA =
      a.deliveryOption.costPerKM * a.distance +
      a.deliveryOption.costPerKG * a.weight;
    var costB =
      b.deliveryOption.costPerKM * b.distance +
      b.deliveryOption.costPerKG * b.weight;
    return costA - costB;
  });

  var remainingBudget = budget;
  var resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  if (selectedItems.length === 0) {
    resultDiv.innerHTML = 'Tidak ada barang yang dapat dikirim sesuai dengan anggaran yang tersedia.';
  } else {
    var resultText = 'Barang yang dapat dikirim:<br>';
    var totalCost = 0;
    var failedItems = [];

    for (var i = 0; i < selectedItems.length; i++) {
      if (selectedItems[i].deliveryOption && selectedItems[i].deliveryOption.costPerKM && selectedItems[i].deliveryOption.costPerKG) {
        var cost =
          selectedItems[i].deliveryOption.costPerKM * selectedItems[i].distance +
          selectedItems[i].deliveryOption.costPerKG * selectedItems[i].weight;
    
        if (cost <= remainingBudget) {
          resultText +=
            'Kota Tujuan: ' +
            getCityName(selectedItems[i].distance) +
            ', Berat: ' +
            selectedItems[i].weight +
            ' kg, Pengiriman: ' +
            selectedItems[i].deliveryOption.name +
            '<br>';
          totalCost += cost;
          remainingBudget -= cost;
        } else {
          var costDifference = cost - remainingBudget;
          failedItems.push({
            index: i + 1,
            costDifference: costDifference
          });
        }
      } else {
        var costDifference = Infinity;
        failedItems.push({
          index: i + 1,
          costDifference: costDifference
        });
      }
    }    

    if (failedItems.length > 0) {
      resultText += '<br>Barang yang tidak dapat dikirim:<br>';
      for (var j = 0; j < failedItems.length; j++) {
        if (failedItems[j].costDifference !== Infinity) {
          resultText +=
            'Barang ke-' +
            failedItems[j].index +
            ' tidak dapat dikirim karena kekurangan dana sebesar ' +
            failedItems[j].costDifference +
            ' Rupiah<br>';
        } else {
          resultText +=
            'Barang ke-' +
            failedItems[j].index +
            ' tidak dapat dikirim karena tidak tersedia opsi pengiriman yang sesuai.<br>';
        }
      }
    }

    resultText += '<br>Total biaya pengiriman: ' + totalCost;
    resultText += '<br>Sisa anggaran: ' + remainingBudget;
    resultDiv.innerHTML = resultText;
  }
}

function getCityName(distance) {
  for (var city in cityDistances) {
    if (cityDistances[city] === distance) {
      return city;
    }
  }
}

document.getElementById('numItems').addEventListener('input', addItemInputs);

function rendercontent1() {
  var greedyVariant = document.getElementById('greedyVariant').value;
  var sel_gre = document.getElementsByClassName('sel_gre')[0];
  var sel_gre_val = sel_gre.options[sel_gre.selectedIndex].value;
  if (greedyVariant === sel_gre_val) {
    return;
  }
  greedyVariant = sel_gre_val;
  var variantText = sel_gre.options[sel_gre.selectedIndex].text;

  var variantContainer = document.getElementById('variantContainer');
  variantContainer.innerHTML = '';

  if (greedyVariant) {
    var variantHeading = document.createElement('h3');
    variantHeading.innerHTML = 'Selected Greedy Variant: ' + variantText;
    variantContainer.appendChild(variantHeading);
  }

  addItemInputs();
}

document.getElementById('greedyVariant').addEventListener('change', rendercontent1);
