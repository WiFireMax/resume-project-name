document.addEventListener("DOMContentLoaded", async function () {
    const editableElements = document.querySelectorAll("[contenteditable='true']");

    function updatePlaceholder(element) {
        element.classList.toggle("empty", element.textContent.trim() === "");
    }

    editableElements.forEach(element => {
        if (!element.dataset.placeholder) return;
        const key = element.dataset.placeholder;
        element.textContent = localStorage.getItem(key) || "";
        updatePlaceholder(element);

        element.addEventListener("input", () => {
            localStorage.setItem(key, element.textContent);
            updatePlaceholder(element);
        });

        element.addEventListener("blur", () => updatePlaceholder(element));
    });

    // ======= Загрузка шрифта для GitHub Pages =======
    async function loadFont() {
        try {
            const response = await fetch('NotoSans-VariableFont_wdth,wght.ttf');
            return await response.arrayBuffer();
        } catch {
            return null; // Используем стандартный шрифт при ошибке
        }
    }

    let fontBase64 = null;
    try {
        const fontData = await loadFont();
        if (fontData) {
            const binary = '';
            const bytes = new Uint8Array(fontData);
            const chunkSize = 8192; // Разбиваем большие массивы на куски

            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
            }

            fontBase64 = btoa(binary);
        }
    } catch (error) {
        console.error("Не удалось загрузить шрифт:", error);
    }

    // ======= Генерация PDF =======
    document.getElementById("download-pdf").addEventListener("click", function () {
        try {
            if (!window.jspdf) throw new Error("Библиотека jsPDF не загружена");

            const { jsPDF } = window.jspdf;
            let doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                hotfixes: ["px_scaling"] // Фикс масштабирования
            });

            // Подключаем Noto Sans, если шрифт был успешно загружен
            if (fontBase64) {
                doc.addFileToVFS("NotoSans.ttf", fontBase64);
                doc.addFont("NotoSans.ttf", "NotoSans", "normal");
                doc.setFont("NotoSans");
            }

            doc.setFontSize(12);

            let y = 20;
            const elements = document.querySelectorAll("h1, h2, p, li");
            const pageWidth = doc.internal.pageSize.getWidth();

            elements.forEach(element => {
                const text = element.textContent;
                const styles = getComputedStyle(element);
                const fontSize = parseInt(styles.fontSize) * 0.75; // Конвертация px->mm
                const marginBottom = parseInt(styles.marginBottom) * 0.75;

                doc.setFontSize(fontSize);
                const lines = doc.splitTextToSize(text, pageWidth - 30);

                lines.forEach(line => {
                    if (y > 280) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, 15, y);
                    y += fontSize + 2;
                });

                y += marginBottom;
            });

            doc.save("resume.pdf");
        } catch (error) {
            alert("Ошибка генерации: " + error.message);
            console.error("Ошибка PDF:", error);
        }
    });

    // ======= Эффект Ripple =======
    document.querySelectorAll("button").forEach(button => {
        button.addEventListener("click", function (e) {
            const ripple = document.createElement("div");
            ripple.className = "ripple";

            const rect = button.getBoundingClientRect();
            ripple.style.left = `${e.clientX - rect.left}px`;
            ripple.style.top = `${e.clientY - rect.top}px`;

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
});