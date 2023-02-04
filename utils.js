function lerp(A, B, t) {
  return A + (B - A) * t;
}

function getIntersection(A, B, C, D) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
  }

  return null;
}

/*  THANK YOU CHAT GPT */
function isPointInterceptsLine(point, lineStart, lineEnd, width) {
  let minX = Math.min(lineStart.x, lineEnd.x) - width / 2;
  let maxX = Math.max(lineStart.x, lineEnd.x) + width / 2;
  let minY = Math.min(lineStart.y, lineEnd.y) - width / 2;
  let maxY = Math.max(lineStart.y, lineEnd.y) + width / 2;

  if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
    return false;
  }

  let lineVector = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y,
  };

  let pointVector = {
    x: point.x - lineStart.x,
    y: point.y - lineStart.y,
  };

  let dotProduct = pointVector.x * lineVector.x + pointVector.y * lineVector.y;
  let lineLength = lineVector.x * lineVector.x + lineVector.y * lineVector.y;
  let projection = dotProduct / lineLength;

  let closestPoint = {
    x: lineStart.x + lineVector.x * projection,
    y: lineStart.y + lineVector.y * projection,
  };

  let distance = Math.sqrt(
    Math.pow(closestPoint.x - point.x, 2) +
      Math.pow(closestPoint.y - point.y, 2)
  );

  return distance <= width / 2;
}
function distanceBetweenPoints(point1, point2) {
  let dx = point2.x - point1.x;
  let dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function indexTo2D(index, cols, rows) {
  const row = Math.floor(index / rows);
  const col = index % cols;
  return {
    x: col,
    y: row,
  };
}

function listEqual(l1, l2) {
  if (!Array.isArray(l1) && !Array.isArray(l2)) return false;

  if (l1.length !== l2.length) return false;

  for (let i = 0; i < l1.length; i++) {
    if (l1[i] !== l2[i]) return false;
  }

  return true;
}

function xyGen(x, y) {
  return `${x},${y}`;
}

function xyParse(str) {
  if (!str) return null;
  if (typeof str !== 'string') return null;

  return {
    x: str.split(',')[0],
    y: str.split(',')[1],
  };
}

function getPointsInPolygon(vertices, stepSize) {
  let minX = Number.POSITIVE_INFINITY,
    minY = Number.POSITIVE_INFINITY,
    maxX = Number.NEGATIVE_INFINITY,
    maxY = Number.NEGATIVE_INFINITY;

  for (let vertex of vertices) {
    minX = Math.min(minX, vertex.x);
    minY = Math.min(minY, vertex.y);
    maxX = Math.max(maxX, vertex.x);
    maxY = Math.max(maxY, vertex.y);
  }

  let points = [];
  for (let x = minX; x <= maxX; x += stepSize) {
    for (let y = minY; y <= maxY; y += stepSize) {
      if (isPointInPolygon({ x, y }, vertices)) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x,
      yi = polygon[i].y;
    let xj = polygon[j].x,
      yj = polygon[j].y;

    let intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

function gaussianRandom() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return gaussianRandom(); // resample between 0 and 1
  return num;
}

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i) rv[i] = arr[i];
  return rv;
}

function getPointsOnLine(lineStart, lineEnd, stepSize) {
  let points = [];
  let xDiff = lineEnd.x - lineStart.x;
  let yDiff = lineEnd.y - lineStart.y;
  let length = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  let numSteps = Math.floor(length / stepSize);

  for (let i = 0; i <= numSteps; i++) {
    let x = Math.floor(lineStart.x + (xDiff * i) / numSteps);
    let y = Math.floor(lineStart.y + (yDiff * i) / numSteps);
    points.push({ x, y });
  }

  return points;
}
