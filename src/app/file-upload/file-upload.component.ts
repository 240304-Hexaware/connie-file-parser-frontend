import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpRequest, HttpErrorResponse, HttpParams, HttpHeaders, HttpResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';



@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css'
})

export class FileUploadComponent {

  title = 'client';
  httpClient: HttpClient;
  file: File | undefined;
  downloadFile: Blob | undefined;
  specifications: Array<Object> = [];
  specData: Array<string> = [];
  specNames: Array<string> = [];
  fileData: string = '';
  filesBySpecData: string = '';
  selectedSpec: string = '';
  selectedSpecType: string = '';
  currentUserId: string = '1';
  filesByUserData: Array<string> = [];
  fileNames: Array<string> = [];
  noFilesMessage: string = '';
  noSpecsMessage: string = '';
  constructor(httpClient: HttpClient) {
    /* the HttpClient needs to be provided, see app.config.ts */
    this.httpClient = httpClient;
  }

  fileSelected(event: any) {
    this.file = event.target.files[0];
  }

  specSelected(event: any) {
    this.selectedSpec = event.target.value;
  }

  specTypeSelected(event: any) {
    this.selectedSpecType = event.target.value;

  }

  uploadSpecification() {
    if (this.file == undefined) {
      alert("No file selected!");
      return;
    }

    let url = "http://localhost:8080/spec"

    let form: FormData = new FormData();
    form.append("specFile", this.file);

    let options: Object = {
      observe: "response",
      responseType: 'text',
      params: new HttpParams({
        fromString: 'userId=' + this.currentUserId
      }),
      headers: new HttpHeaders({
        username: "ctsang"//for our trusting system
      })
    }

    let response = this.httpClient.post(url, form, options);


    response.subscribe({
      next: (data: any) => {
        //We can view the headers from the response, which come in the form of a map.
        let respHeaders = data.headers;
        let keys = respHeaders.keys();
        for (let key of keys) {
          console.log(key, respHeaders.get(key));
        }

        let fileName: string | null = "specification.json";
        let fileBody: string | null = data.body;
        this.downloadFile = new Blob([fileBody as string], { type: "application/json" });
      },
      error: (error: HttpErrorResponse) => {
        console.log("error: ", error);
        alert("A specification of that name has already been uploaded.");
      },
      complete: () => {
        console.log("Http response complete!")
        this.getSpecifications();
      }
    })
  }

  uploadFile() {
    if (this.file == undefined) {
      alert("No file selected!");
      return;
    }

    let url = "http://localhost:8080/files"

    let form: FormData = new FormData();
    form.append("file", this.file);

    let options: Object = {
      observe: "body",
      responseType: 'text',
      params: new HttpParams({
        fromString: 'userId=' + this.currentUserId + '&specName=' + this.selectedSpec
      }),
      headers: new HttpHeaders({
        username: 'ctsang'//for our trusting system
      })
    }

    let response = this.httpClient.post(url, form, options);


    response.subscribe({
      next: (data: any) => {

        this.fileData = data;
        this.getFilesByUser();
      },
      error: (error: HttpErrorResponse) => {
        console.log("error: ", error);
        alert(error.message);
      },
      complete: () => {
        console.log("Successfully uploaded file")
      }
    })


  }

  getSpecifications() {
    let url = "http://localhost:8080/specs"

    let response = this.httpClient.get(url)
    response.subscribe({
      next: (data: any) => {
        //data is an array of objects? (SpecificationFile from backend)
        // specData is an array of JSON strings
        this.specData = data.map((obj: any) => JSON.stringify(obj));
        this.specNames = this.specData.map((json: string) => JSON.parse(json).name);
      },
      error: (error: HttpErrorResponse) => {
        console.log("error: ", error);
        alert(error.message);
      },
      complete: () => {
        console.log("Got all specifications")
      }
    })
  }

  getFilesBySpecificationType() {
    let url = "http://localhost:8080/files/specType" + "?specName=" + this.selectedSpecType
    let response = this.httpClient.get(url)
    response.subscribe({
      next: (data: any) => {
        this.filesBySpecData = data.map((obj: any) => JSON.stringify(obj));
        this.noSpecsMessage = "You haven't uploaded any files with this specification type yet."
      },
      error: (error: HttpErrorResponse) => {
        console.log("error: ", error);
        alert(error.message);
      },
      complete: () => {
        console.log("Got all files of a specific type")
      }
    })
  }

  getFilesByUser() {
    let url = "http://localhost:8080/files/user?userId=" + this.currentUserId;
    let response = this.httpClient.get(url)
    response.subscribe({
      next: (data: any) => {
        this.filesByUserData = data.map((obj: any) => JSON.stringify(obj));
        this.noFilesMessage = "You haven't uploaded any files yet. Please upload a file first."

      },
      error: (error: HttpErrorResponse) => {
        console.log("error: ", error);
        alert(error.message);
      },
      complete: () => {
        console.log("Got all files from userId " + this.currentUserId)
      }
    })

  }

  ngOnInit() {
    this.getSpecifications()
  }

}
