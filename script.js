const COLUMNS_SIZE = 41 // количество колонок в лабиринте
const ROWS_SIZE = 31 // количество строк в лабиринте
const FIELD_SIZE = 20 // размер клетки в лабиринте
const PADDING = 20 // рамка (отступ внутри канваса)
// количество тракторов, которые должны быть на поле
const TRACTORS_NUMBER = 1

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
const map = generatMaze(COLUMNS_SIZE-2, ROWS_SIZE-2, TRACTORS_NUMBER)

const way = []
let onlyPath = false

init()
start()

// функция изначально регистрирует функцию tick() в requestAnimationFrame
function start () {
	// requestAnimationFrame() позволяет регистрировать функцию, которая будет вызвана перед обновлением экрана
	clearCanvas()
	drawMap()
	drawStartPoint()
}

// функция инициализирует стартовые данные
function init() {
	// размеры канваса
	canvas.width = PADDING * 2 + (COLUMNS_SIZE) * FIELD_SIZE
	canvas.height = PADDING * 2 + (ROWS_SIZE) * FIELD_SIZE

}

// функция отрисовывает карту
function drawMap () {
	for (let x = 0; x < COLUMNS_SIZE; x++) {
		for (let y = 0; y < ROWS_SIZE; y++) {
			if (getField(x, y) === 'wall') {
				context.fillStyle = 'black'
				context.beginPath()
				context.rect(PADDING + x * FIELD_SIZE, PADDING + y * FIELD_SIZE, FIELD_SIZE, FIELD_SIZE)
				context.fill()
			}
		}
	}
}

function drawStartPoint() {
	for (let x = 1; x < COLUMNS_SIZE + 1; x++) {
		if (getField(x,0) === 'space') {
			context.fillStyle = 'red'
			context.beginPath()
			context.rect(PADDING + x * FIELD_SIZE + Math.floor(FIELD_SIZE/4),
						 Math.floor(FIELD_SIZE/4),
						 Math.floor(FIELD_SIZE /2), Math.floor(FIELD_SIZE / 2))
			context.fill()
			way.push([x,-1, 1])
		}
	}
}

function clearWay() {
	drawWay(way, true)
	while(way.length !== 1) {
		way.pop()
	}
}

function findWay() {
	if (way.length === 1) {
		// Это старт - просто двигаемся вниз
		way.push([way[0][0],0,1])
	} else {
		if(onlyPath) {
			drawWay(way, true)
		}
		let current = way[way.length-1];
		let direction = current[2] // 1 -> двигались вниз, 2 -> направо, 3 -> вверх, 4 -> налево
		let top_cell = getField(current[0], current[1]-1)
		let left_cell = getField(current[0]-1, current[1])
		let rigth_cell = getField(current[0]+1, current[1])
		let bottom_cell = getField(current[0], current[1]+1)
		let arr_cells = []
		arr_cells.push([left_cell, 4])
		arr_cells.push([bottom_cell, 1])
		arr_cells.push([rigth_cell, 2])
		arr_cells.push([top_cell, 3])
		arr_cells.push([left_cell, 4])
		arr_cells.push([bottom_cell, 1])
		arr_cells.push([rigth_cell, 2])
		let ind = direction - 1
		while (arr_cells[ind][0] === 'wall') {
			ind++;
		}
		let new_dir = arr_cells[ind][1]
		way.push([current[0] + ((new_dir+1)%2) * (3 - new_dir)
				  , current[1] + (new_dir%2) * (2 - new_dir),
				  new_dir])
		if (way[way.length-1][1] === ROWS_SIZE) {
			window.clearInterval(window.myInt)
			window.btnToEnable.disabled=false
		}
	}
	if(onlyPath) {
		updateWay()
	}
	drawWay(way, false)
}

function updateWay() {
	if (!onlyPath) {
		return
	}
	let last = way[way.length-1]
	let identical = undefined
	for (let ind = way.length - 2; ind > 0; ind--) {
		if (way[ind][0] === last[0] && way[ind][1] === last[1]) {
			identical = way[ind]
		}
	}
	if(identical) {
		while (way.pop() !== identical) {

		}
		way.push(last)
	}
}

// функция рисует путь от начальной ячейки к конечной
function drawWay (way, clear) {
	// так как каждая ячейка это по сути массив с координатами x, y,
	// то их в цикле можно сразу забрать в переменную [x, y]
	for (const [x, y, direction] of way) {
		context.fillStyle = clear? 'white':'red'
		context.beginPath()
		context.rect(PADDING + x * FIELD_SIZE + Math.floor(FIELD_SIZE/4),
					 PADDING + y * FIELD_SIZE + Math.floor(FIELD_SIZE/4),
					 Math.floor(FIELD_SIZE / 2), Math.floor(FIELD_SIZE / 2))
		context.fill()
	}
	let x = way[way.length - 1][0]
	let y = way[way.length - 1][1]
	context.fillStyle = clear? 'white':'yellow'
	context.beginPath()
	context.rect(PADDING + x * FIELD_SIZE + Math.floor(FIELD_SIZE/4),
				 PADDING + y * FIELD_SIZE + Math.floor(FIELD_SIZE/4),
				 Math.floor(FIELD_SIZE / 2), Math.floor(FIELD_SIZE / 2))
	context.fill()
}

// функция очищает canvas
function clearCanvas () {
	// Здесь создается рамка (черное поле, затем внутри нарисуем белое)
	// каким цветом делать заливку
	context.fillStyle = 'grey'
	// создать новую элементарную геометрическую фигуру
	context.beginPath()
	// прямоугольник (верхний левый угол, ширина и высота прямоугольника)
	context.rect(0, 0, canvas.width, canvas.height)
	// залить фигуру выбранным для заливки цветом
	context.fill()

	// здесь создается белое поле внутри рамки
	context.fillStyle = 'white'
	context.beginPath()
	context.rect(PADDING, PADDING, canvas.width - PADDING * 2, canvas.height - PADDING * 2)
	context.fill()
}

// получить значение из матрицы
function getField (x, y) {
	if (x < 0 || x >= COLUMNS_SIZE || y < 0 || y >= ROWS_SIZE) {
		return null
	}

	return map[y][x]
}

// записать значение в матрицу
function setField (x, y, value) {
	if (x < 0 || x >= COLUMNS_SIZE || y < 0 || y >= ROWS_SIZE) {
		return null
	}

	map[y][x] = value
}

function updateCheck(e) {
	onlyPath = e.target.checked
}
