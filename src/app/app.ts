import { Component, signal } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DragDropModule, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // PDF upload files
  files: File[] = [];
  // Output PDF name
  outputName: string = 'merged';
  // Loading spinner
  isLoading: boolean = false;
  // Title signal
  protected readonly title = signal('pdf');

  // When files are selected
  onFilesSelected(event: any) {
    const selectedFiles: FileList = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      this.files.push(selectedFiles[i]);
    }
  }

  // Drag-and-drop reordering
  drop(event: CdkDragDrop<File[]>) {
    moveItemInArray(this.files, event.previousIndex, event.currentIndex);
  }

  // Prevent default behavior when dragging files over
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // Handle files dropped into the drop area
  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      const droppedFiles = event.dataTransfer.files;
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        if (file.type === 'application/pdf') {
          this.files.push(file);
        }
      }
    }
  }

  // Clear all uploaded files
  clearAll() {
    this.files = [];
    this.outputName = 'merged';
  }

  // Merge PDFs
  async mergePDFs() {
    if (this.files.length === 0) return alert('No files selected!');

    this.isLoading = true; // start spinner

    try {
      const mergedPdf = await PDFDocument.create();

      for (let file of this.files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedBytes = await mergedPdf.save();
      const byteArray = Uint8Array.from(mergedBytes);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      saveAs(blob, `${this.outputName || 'merged'}.pdf`);
    } catch (err) {
      console.error('Error merging PDFs:', err);
      alert('Failed to merge PDFs. Check console for details.');
    } finally {
      this.isLoading = false; // stop spinner
    }
  }
}


