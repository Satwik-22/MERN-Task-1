const express = require("express")
const fs = require("fs")
const path = require("path")
const PORT = process.env.PORT || 3000

const app = express()

const file = path.join(__dirname, "products.json")

// Middleware 
app.use(express.json())
app.use(express.static(path.join(__dirname, "ui")));


function read() { 
    if (!fs.existsSync(file)) { 
        return { counter: 0, items: [] } 
    } 
    const data = fs.readFileSync(file, "utf-8").trim() 
    return data ? JSON.parse(data) : { counter: 0, items: [] } 
} 

function write(data) { 
    fs.writeFileSync(file, JSON.stringify(data, null, 2)) 
} 



app.get("/products", (req, res) => { 
    const data = read() 
    if (!data) return res.status(400).json({ error: "File not found" }) 
    res.json(data.items) 
}) 


app.get("/products/:id", (req, res) => { 
    const { id } = req.params 
    const data = read() 
    if (!data) return res.status(400).json({ error: "File not found" }) 
    const productIndex = data.items.findIndex((p) => p.id == parseInt(id)) 
    if (productIndex === -1) return res.status(404).json({ error: "Product not found" }) 
    res.json(data.items[productIndex]) 
}) 
 


app.post("/products", (req, res) => { 
    const { name, price } = req.body 
    if (!name || !price === undefined || isNaN(price)) { 
        return res.status(400).json({ error: "Valid name and price are required" }) 
    }
    const data = read() 
    const newProduct = { id: ++data.counter, name, price: Number(price)} 
    data.items.push(newProduct) 
    write(data) 
    res.status(201).json({ message: " Product added successfully", product: newProduct }) 
}) 
 


app.put("/products/:id", (req, res) => { 
    const  {id}  = req.params 
    const { name, price } = req.body 
    const data = read() 
    const productIndex = data.items.findIndex(p => p.id === parseInt(id)) 
    
    if (productIndex === -1) return res.status(404).json({ error: " Product not found" }) 
        
    if (!name || !price === undefined || isNaN(price)) { 
        return res.status(400).json({ error: "Name and price are required" }) 
    } 
    
    data.items[productIndex] = { ...data.items[productIndex], name, price: Number(price)} 
    write(data) 
    res.json({ message: "Product updated successfully", product: data.items[productIndex] }) 
}) 
 


app.delete("/products/:id", (req, res) => { 
    const { id } = req.params 
    const data = read() 
    const filteredItems = data.items.filter((p) => p.id !== parseInt(id))
    
    if (data.items.length === filteredItems.length) { 
        return res.status(404).json({ error: " Product not found" }) 
    } 
    data.items = filteredItems 
    write(data) 
    res.json({ message: ` Product with id ${id} deleted successfully` }) 
}) 

app.use((req, res) => { 
    res.status(404).json({ error: " Route not found" }) 
}) 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});