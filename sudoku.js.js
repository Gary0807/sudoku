class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.initialBoard = [];
        this.startTime = 0;
        this.timerInterval = null;
        this.difficulty = 'medium';
        
        this.difficultyConfig = {
            easy: 30,
            medium: 25,
            hard: 20,
            expert: 15
        };
        
        this.difficultyText = {
            easy: '簡單',
            medium: '普通',
            hard: '困難',
            expert: '專家'
        };
    }

    // 生成完整的數獨解答
    generateSolution() {
        const board = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillSudoku(board);
        return board;
    }

    // 遞歸填充數獨
    fillSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const numbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (let num of numbers) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.fillSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // 驗證是否可以放置數字
    isValid(board, row, col, num) {
        // 檢查行
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) {
                return false;
            }
        }

        // 檢查列
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) {
                return false;
            }
        }

        // 檢查 3x3 方框
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    // 打亂數組
    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    countSolutions(board, limit = 2) {
        const clone = board.map(row => [...row]);
        return this.solveCount(clone, limit);
    }

    solveCount(board, limit) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    let total = 0;
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            total += this.solveCount(board, limit);
                            board[row][col] = 0;
                            if (total >= limit) {
                                return total;
                            }
                        }
                    }
                    return total;
                }
            }
        }
        return 1;
    }

    // 生成新遊戲
    generateGame(difficulty) {
        this.difficulty = difficulty;
        this.solution = this.generateSolution();

        // 複製解答
        this.board = this.solution.map(row => [...row]);

        const cellsToRemove = this.difficultyConfig[difficulty];
        const indices = this.shuffle(Array.from({ length: 81 }, (_, i) => i));
        let removed = 0;

        for (const idx of indices) {
            if (removed >= cellsToRemove) break;

            const row = Math.floor(idx / 9);
            const col = idx % 9;

            if (this.board[row][col] === 0) continue;

            const backup = this.board[row][col];
            this.board[row][col] = 0;

            if (this.countSolutions(this.board, 2) !== 1) {
                this.board[row][col] = backup;
            } else {
                removed++;
            }
        }

        this.initialBoard = this.board.map(row => [...row]);
        this.startTime = Date.now();
        this.startTimer();
    }

    // 啟動計時器
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // 停止計時器
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // 檢查是否完成遊戲
    isGameComplete() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    // 檢查數字的有效性
    isValidMove(row, col, num) {
        const originalNum = this.board[row][col];
        this.board[row][col] = num;
        
        // 檢查行
        for (let x = 0; x < 9; x++) {
            if (x !== col && this.board[row][x] === num) {
                this.board[row][col] = originalNum;
                return false;
            }
        }

        // 檢查列
        for (let x = 0; x < 9; x++) {
            if (x !== row && this.board[x][col] === num) {
                this.board[row][col] = originalNum;
                return false;
            }
        }

        // 檢查 3x3 方框
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const r = i + startRow;
                const c = j + startCol;
                if ((r !== row || c !== col) && this.board[r][c] === num) {
                    this.board[row][col] = originalNum;
                    return false;
                }
            }
        }

        this.board[row][col] = originalNum;
        return true;
    }

    // 驗證當前遊戲狀態
    validateBoard() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] !== 0) {
                    const num = this.board[i][j];
                    this.board[i][j] = 0;
                    
                    if (!this.isValid(this.board, i, j, num)) {
                        this.board[i][j] = num;
                        return false;
                    }
                    
                    this.board[i][j] = num;
                }
            }
        }
        return true;
    }

    // 提供提示
    giveHint() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] === 0 && this.initialBoard[i][j] === 0) {
                    return { row: i, col: j, value: this.solution[i][j] };
                }
            }
        }
        return null;
    }

    // 重置為初始狀態
    resetGame() {
        this.board = this.initialBoard.map(row => [...row]);
    }
}

class SudokuUI {
    constructor() {
        this.game = new SudokuGame();
        this.selectedCell = null;
        this.hintCell = null;
        this.isNoteMode = false; // 新增：筆記模式狀態
        this.notes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set())); // 新增：筆記資料
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStatsModal(); // 初始化載入戰績
        this.startNewGame();
    }

    setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', () => this.startNewGame());
        document.getElementById('checkBtn').addEventListener('click', () => this.checkGame());
        document.getElementById('hintBtn').addEventListener('click', () => this.provideHint());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.game.difficulty = e.target.value;
        });

        // 彈出式說明視窗
        const ruleModal = document.getElementById('ruleModal');
        document.getElementById('ruleBtn').addEventListener('click', () => {
            ruleModal.style.display = 'flex';
        });
        document.querySelector('.close-btn').addEventListener('click', () => {
            ruleModal.style.display = 'none';
        });

        // 戰績視窗
        const statsModal = document.getElementById('statsModal');
        document.getElementById('statsBtn').addEventListener('click', () => {
            this.updateStatsModal();
            statsModal.style.display = 'flex';
        });
        document.querySelector('.close-stats-btn').addEventListener('click', () => {
            statsModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === ruleModal) ruleModal.style.display = 'none';
            if (e.target === statsModal) statsModal.style.display = 'none';
        });

        // 深色模式切換
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ 淺色' : '🌙 深色';
        });

        // 筆記模式切換按鈕
        const noteToggleBtn = document.getElementById('noteToggleBtn');
        noteToggleBtn.addEventListener('click', () => {
            this.isNoteMode = !this.isNoteMode;
            if (this.isNoteMode) {
                noteToggleBtn.textContent = '✏️ 筆記模式: 開';
                noteToggleBtn.classList.add('note-active');
            } else {
                noteToggleBtn.textContent = '✏️ 筆記模式: 關';
                noteToggleBtn.classList.remove('note-active');
            }
        });

        // 虛擬數字鍵盤邏輯 (整合筆記模式)
        const numBtns = document.querySelectorAll('.num-btn:not(.action-btn)');
        numBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.selectedCell) {
                    this.showMessage('請先點擊一個要填寫的空格！', 'info');
                    return;
                }
                const num = parseInt(e.target.textContent);
                const { row, col } = this.selectedCell;
                const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
                
                if (input && !input.disabled) {
                    if (this.isNoteMode) {
                        // 處理筆記
                        if (this.notes[row][col].has(num)) {
                            this.notes[row][col].delete(num);
                        } else {
                            this.notes[row][col].add(num);
                        }
                        this.updateNotesDisplay(row, col);
                    } else {
                        // 正常填寫
                        input.value = num;
                        input.dispatchEvent(new Event('input'));
                        // 填寫正常數字後清空該格筆記
                        this.notes[row][col].clear();
                        this.updateNotesDisplay(row, col);
                    }
                }
            });
        });

        // 虛擬鍵盤清除按鈕
        document.getElementById('numpadClear').addEventListener('click', () => {
            if (!this.selectedCell) return;
            const { row, col } = this.selectedCell;
            const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
            if (input && !input.disabled) {
                input.value = '';
                input.dispatchEvent(new Event('input'));
                this.notes[row][col].clear();
                this.updateNotesDisplay(row, col);
            }
        });
    }

    startNewGame() {
        const difficulty = document.getElementById('difficultySelect').value;
        this.game.generateGame(difficulty);
        
        document.getElementById('difficulty').textContent = this.game.difficultyText[difficulty];
        document.getElementById('timer').textContent = '0:00';
        this.clearMessage();
        this.hintCell = null;
        this.selectedCell = null;
        // 清空所有筆記
        this.notes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));
        this.renderBoard();
    }

    renderBoard() {
        const boardElement = document.getElementById('sudokuBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                if (col % 3 === 2 && col !== 8) cell.classList.add('box-border-right');
                if (row % 3 === 2 && row !== 8) cell.classList.add('box-border-bottom');
                
                const cellDiv = document.createElement('div');
                cellDiv.className = 'sudoku-cell';
                
                // 新增：筆記顯示層 (放在 input 底下)
                const notesGrid = document.createElement('div');
                notesGrid.className = 'notes-grid';
                notesGrid.id = `notes-${row}-${col}`;
                for(let i=1; i<=9; i++) {
                    const span = document.createElement('span');
                    span.className = 'note-num';
                    span.id = `note-${row}-${col}-${i}`;
                    notesGrid.appendChild(span);
                }
                
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1'; input.max = '9';
                input.dataset.row = row; input.dataset.col = col;
                
                if (this.game.initialBoard[row][col] !== 0) {
                    input.value = this.game.initialBoard[row][col];
                    input.classList.add('given');
                    input.disabled = true;
                } else if (this.game.board[row][col] !== 0) {
                    input.value = this.game.board[row][col];
                }
                
                input.addEventListener('click', () => this.selectCell(input));
                input.addEventListener('input', (e) => this.handleInput(e, row, col));
                input.addEventListener('keydown', (e) => this.handleKeydown(e));
                
                cellDiv.appendChild(notesGrid);
                cellDiv.appendChild(input);
                cell.appendChild(cellDiv);
                boardElement.appendChild(cell);
            }
        }

        if (this.selectedCell) this.highlightCell(this.selectedCell.row, this.selectedCell.col);
    }

    updateNotesDisplay(row, col) {
        const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
        for(let i=1; i<=9; i++) {
            const span = document.getElementById(`note-${row}-${col}-${i}`);
            // 只有當 input 沒有值的時候才顯示筆記
            if (this.notes[row][col].has(i) && !input.value) {
                span.textContent = i;
            } else {
                span.textContent = '';
            }
        }
    }

    selectCell(input) {
        if (input.disabled) return;
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        document.querySelectorAll('.sudoku-cell').forEach(cell => cell.classList.remove('selected', 'related'));
        this.selectedCell = { row, col };
        this.highlightCell(row, col);
        input.focus();
    }

    highlightCell(row, col) {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            const r = parseInt(input.dataset.row);
            const c = parseInt(input.dataset.col);
            const cellDiv = input.closest('.sudoku-cell');
            
            if (r === row && c === col) {
                cellDiv.classList.add('selected');
            } else if (r === row || c === col || 
                      (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3))) {
                cellDiv.classList.add('related');
            }
        });
    }

    handleInput(e, row, col) {
        // 如果開啟實體鍵盤輸入，且在筆記模式下，攔截它並轉為筆記
        if (this.isNoteMode && e.isTrusted) { // isTrusted 判斷是否為真實鍵盤輸入，而非 JS 觸發
            const val = parseInt(e.target.value.slice(-1)); // 取最後輸入的數字
            e.target.value = this.game.board[row][col] || ''; // 恢復原狀
            if (val >= 1 && val <= 9) {
                if (this.notes[row][col].has(val)) this.notes[row][col].delete(val);
                else this.notes[row][col].add(val);
                this.updateNotesDisplay(row, col);
            }
            return;
        }

        const value = e.target.value;
        const cellDiv = e.target.closest('.sudoku-cell');

        if (value === '') {
            this.game.board[row][col] = 0;
            cellDiv.classList.remove('error');
            this.updateNotesDisplay(row, col); // 清空時顯示原本的筆記
        } else {
            const num = parseInt(value);
            if (num >= 1 && num <= 9) {
                this.game.board[row][col] = num;
                this.updateNotesDisplay(row, col); // 隱藏筆記
                if (!this.game.isValidMove(row, col, num)) {
                    cellDiv.classList.add('error');
                    this.showMessage('此處有衝突，請檢查輸入。', 'error');
                } else {
                    cellDiv.classList.remove('error');
                    this.clearMessage();
                }
            } else {
                e.target.value = this.game.board[row][col] || '';
            }
        }
    }

    handleKeydown(e) {
        if (!this.selectedCell) return;
        let { row, col } = this.selectedCell;
        
        switch(e.key) {
            case 'ArrowUp': row = (row - 1 + 9) % 9; e.preventDefault(); break;
            case 'ArrowDown': row = (row + 1) % 9; e.preventDefault(); break;
            case 'ArrowLeft': col = (col - 1 + 9) % 9; e.preventDefault(); break;
            case 'ArrowRight': col = (col + 1) % 9; e.preventDefault(); break;
            case 'Delete':
            case 'Backspace':
                if (this.game.initialBoard[row][col] === 0) {
                    this.game.board[row][col] = 0;
                    e.target.value = '';
                    this.notes[row][col].clear();
                    this.updateNotesDisplay(row, col);
                }
                e.preventDefault();
                return;
            default: return;
        }
        
        const nextInput = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
        if (nextInput && !nextInput.disabled) nextInput.click();
    }

    checkGame() {
        let hasEmpty = false;
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.game.board[i][j] === 0) { hasEmpty = true; break; }
            }
            if (hasEmpty) break;
        }
        
        if (hasEmpty) {
            this.showMessage('還有空格未填！', 'error');
            return;
        }
        
        if (this.game.validateBoard()) {
            this.game.stopTimer();
            this.showMessage('恭喜！你完成了數獨！', 'success');
            
            // 觸發撒花特效
            if (typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
            
            // 儲存戰績
            this.saveStats();
        } else {
            this.showMessage('有衝突的數字，請檢查！', 'error');
        }
    }

    saveStats() {
        const elapsed = Math.floor((Date.now() - this.game.startTime) / 1000);
        const difficulty = this.game.difficulty;
        let bestTime = localStorage.getItem(`sudoku_best_${difficulty}`);
        
        if (!bestTime || elapsed < parseInt(bestTime)) {
            localStorage.setItem(`sudoku_best_${difficulty}`, elapsed);
            setTimeout(() => {
                this.showMessage('🎉 破紀錄啦！這是你該難度的最快成績！', 'success');
            }, 1500);
        }
        this.updateStatsModal();
    }

    updateStatsModal() {
        const formats = { easy: '簡單', medium: '普通', hard: '困難', expert: '專家' };
        for (let diff in formats) {
            const bestTime = localStorage.getItem(`sudoku_best_${diff}`);
            const el = document.getElementById(`stat-${diff}`);
            if (el) {
                if (bestTime) {
                    const minutes = Math.floor(parseInt(bestTime) / 60);
                    const seconds = parseInt(bestTime) % 60;
                    el.textContent = `${minutes}分 ${seconds}秒`;
                } else {
                    el.textContent = '無紀錄';
                }
            }
        }
    }

    provideHint() {
        const hint = this.game.giveHint();
        if (hint) {
            const input = document.querySelector(`input[data-row="${hint.row}"][data-col="${hint.col}"]`);
            if (input) {
                input.value = hint.value;
                this.game.board[hint.row][hint.col] = hint.value;
                input.dispatchEvent(new Event('input'));
                input.closest('.sudoku-cell').classList.add('hint');
                this.hintCell = { row: hint.row, col: hint.col };
                this.showMessage('已提供提示！', 'info');
                setTimeout(() => {
                    input.closest('.sudoku-cell').classList.remove('hint');
                    this.hintCell = null;
                }, 1500);
            }
        } else {
            this.showMessage('沒有更多提示了！', 'error');
        }
    }

    resetGame() {
        this.game.resetGame();
        this.selectedCell = null;
        this.hintCell = null;
        this.clearMessage();
        this.notes = Array(9).fill(null).map(() => Array(9).fill(null).map(() => new Set()));
        this.renderBoard();
    }

    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
    }

    clearMessage() {
        const messageEl = document.getElementById('message');
        messageEl.textContent = '';
        messageEl.className = 'message';
    }
}

// 初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new SudokuUI();
});
