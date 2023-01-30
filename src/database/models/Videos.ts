export class Videos{

    constructor(
        private id:string,
        private title:string,
        private duration:string,
        private createdAt:string
    
    )
{

}
public getId():string{
    return this.id
}

public setId(newId:string):void{
    this.id = newId
}

public getTitle():string{
    return this.title
}

public setTitle(newTitle:string):void{
    this.title = newTitle
}

public getDuration():string{
    return this.duration
}

public setDuration(newDuration:string):void{
    this.duration = newDuration
}


public getCreatedAt():string{
    return this.createdAt
}

public setCreatedAt(newCreatedAt:string):void{
    this.createdAt = newCreatedAt
}

}