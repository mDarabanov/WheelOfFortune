const freeSpins = 'Free spins';
const noMoreCredits = 'No  credits!';
const creditsMessage = 'Credits:';

let padding = {
  top: 20,
  right: 40,
  bottom: 0,
  left: 0,
};
let width = 500 - padding.left - padding.right;
let height = 500 - padding.top - padding.bottom;
let radius = Math.min(width, height) / 2;
let rotation = 0;
let oldRotation = 0;
let picked = 100000;
let oldPick = [];
let total = 0;
let color = d3.scale.category20();
let credits = 10;
let firstSectorCounter = 3;
let secondSectorCounter = 2;
let lastRotation = 0;
let freeSpinsCounter = 3;
let data = [
  {
    label: '100$',
    value: 100,
  },
  {
    label: '200$',
    value: 200,
  },
  {
    label: '300$',
    value: 300,
  },
  {
    label: '400$',
    value: 400,
  },
  {
    label: '500$',
    value: 500,
  },
  {
    label: `${freeSpins}`,
    value: 0,
  },
  {
    label: '1 000$',
    value: 1000,
  },
  {
    label: '2 000$',
    value: 2000,
  },
  {
    label: '5000$',
    value: 5000,
  },
  {
    label: '10 000$',
    value: 10000,
  },
  {
    label: '15 000$',
    value: 15000,
  },
  {
    label: '50 000$',
    value: 50000,
  },
  {
    label: '100 000$',
    value: 100000,
  },
  {
    label: '500 000$',
    value: 500000,
  },
];

let svg = d3
  .select('#chart')
  .append('svg')
  .data([data])
  .attr('width', width + padding.left + padding.right)
  .attr('height', height + padding.top + padding.bottom);

let container = svg
  .append('g')
  .attr('class', 'chartholder')
  .attr(
    'transform',
    'translate(' +
      (width / 2 + padding.left) +
      ',' +
      (height / 2 + padding.top) +
      ')'
  );

let vis = container.append('g');

let pie = d3.layout
  .pie()
  .sort(null)
  .value(function (d) {
    return 1;
  });

let arc = d3.svg.arc().outerRadius(radius);

let arcs = vis
  .selectAll('g.slice')
  .data(pie)
  .enter()
  .append('g')
  .attr('class', 'slice');

arcs
  .append('path')
  .attr('fill', function (d, i) {
    return color(i);
  })
  .attr('d', function (d) {
    return arc(d);
  });

arcs
  .append('text')
  .attr('transform', function (d) {
    d.innerRadius = 0;
    d.outerRadius = radius;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return (
      'rotate(' +
      ((d.angle * 180) / Math.PI - 90) +
      ')translate(' +
      (d.outerRadius - 10) +
      ')'
    );
  })
  .attr('text-anchor', 'end')
  .text(function (d, i) {
    return data[i].label;
  });
svg
  .append('g')
  .attr(
    'transform',
    'translate(' +
      (width + padding.left + padding.right) +
      ',' +
      (height / 2 + padding.top) +
      ')'
  )
  .append('path')
  .attr(
    'd',
    'M-' +
      radius * 0.15 +
      ',0L0,' +
      radius * 0.05 +
      'L0,-' +
      radius * 0.05 +
      'Z'
  )
  .style({ fill: 'black' });

container
  .append('circle')
  .attr('cx', 0)
  .attr('cy', 0)
  .attr('r', 60)
  .style({ fill: 'white', cursor: 'pointer' });

container
  .append('text')
  .attr('x', 0)
  .attr('y', 15)
  .attr('text-anchor', 'middle')
  .text(`${creditsMessage}` + credits)
  .style({ 'font-weight': 'bold', 'font-size': '20px' });

container.on('click', spin);

function spin(d) {
  container.on('click', null);

  if (credits === 9) {
    lastRotation = oldRotation + 720;
  }

  let currentCredits = credits;

  let pieSlice = 360 / data.length;

  let rotationRandomNumberGenerate = Math.floor(Math.random() * 3600 + 360);

  rotation = Math.round(rotationRandomNumberGenerate / pieSlice) * pieSlice;
  if (credits === 10) {
    rotation = 231;
  }
  if (credits < 9) {
    if (credits % 2 === 0) {
      if (firstSectorCounter > 0) {
        rotation = lastRotation - pieSlice;
        firstSectorCounter--;
      }
    } else {
      if (secondSectorCounter > 0) {
        rotation = lastRotation + pieSlice;

        secondSectorCounter--;
      }
    }
  }

  picked = Math.round(data.length - (rotation % 360) / pieSlice);
  picked = picked >= data.length ? picked % data.length : picked;

  if (credits <= 0) {
    let chart = document.getElementById('chart');
    let fontSizeChange = (chart.firstElementChild.children[0].lastElementChild.style =
      'font-size: 15px');
    let textChange = (chart.firstElementChild.children[0].lastElementChild.textContent = `${noMoreCredits}`);
    container.on('click', null);
    return;
  }
  currentCredits--;
  credits--;

  let reduceCredits = (chart.firstElementChild.children[0].lastElementChild.textContent =
    `${creditsMessage}` + currentCredits);

  rotation += 90 - Math.round(pieSlice / 2);

  vis
    .transition()
    .duration(5000)
    .attrTween('transform', rotTween)
    .each('end', function () {
      d3.select('#prize h1').text(data[picked].label);
      d3.select('#total span').text((total += data[picked].value));
      oldRotation = rotation;
      if (data[picked].label === `${freeSpins}`) {
        freeSpinsCounter = 2;
        d3.select(this).call(bonus);
      } else {
        container.on('click', spin);
      }
    });
}

function rotTween(to) {
  let i = d3.interpolate(oldRotation % 360, rotation);

  return function (t) {
    return 'rotate(' + i(t) + ')';
  };
}

function bonus() {
  if (freeSpinsCounter === 0) {
    container.on('click', spin);

    return;
  }
  container.on('click', null);

  let pieSlice = 360 / data.length;

  let rotationRandomNumberGenerate = Math.floor(Math.random() * 3600 + 360);

  rotation = Math.round(rotationRandomNumberGenerate / pieSlice) * pieSlice;

  picked = Math.round(data.length - (rotation % 360) / pieSlice);
  picked = picked >= data.length ? picked % data.length : picked;

  rotation += 90 - Math.round(pieSlice / 2);

  vis
    .transition()
    .duration(5000)
    .attrTween('transform', rotTween)
    .each('end', function () {
      d3.select('#prize h1').text(data[picked].label);
      d3.select('#total span').text((total += data[picked].value));
      oldRotation = rotation;
      d3.select(this).call(bonus);
      freeSpinsCounter--;
    });
}
