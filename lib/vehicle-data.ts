// Common Enthusiast Vehicles Database
// Can be expanded or replaced with an API later

export const YEARS = Array.from({ length: 35 }, (_, i) => (new Date().getFullYear() - i).toString())

export const MAKES_AND_MODELS: Record<string, string[]> = {
    "Acura": ["Integra", "RSX", "NSX", "TL", "TSX", "MDX", "RDX"],
    "Audi": ["A3", "A4", "S4", "RS4", "A5", "S5", "RS5", "A6", "S6", "RS6", "R8", "TT", "Q5", "Q7"],
    "BMW": ["3 Series", "M3", "5 Series", "M5", "X3", "X5", "Z3", "Z4", "1 Series", "2 Series", "M2"],
    "Chevrolet": ["Corvette", "Camaro", "Silverado", "Tahoe", "Suburban", "Colorado", "Impala"],
    "Dodge": ["Challenger", "Charger", "Viper", "Ram 1500", "Durango"],
    "Ford": ["Mustang", "F-150", "Bronco", "Focus ST/RS", "Fiesta ST", "Ranger", "Explorer"],
    "Honda": ["Civic", "Civic Type R", "Accord", "S2000", "CR-V", "Pilot", "Odyssey", "Prelude"],
    "Hyundai": ["Veloster N", "Elantra N", "Genesis Coupe", "Sonata", "Tucson", "Santa Fe"],
    "Infiniti": ["G35", "G37", "Q50", "Q60", "QX50", "QX60"],
    "Jeep": ["Wrangler", "Cherokee", "Grand Cherokee", "Gladiator"],
    "Lexus": ["IS", "IS F", "ES", "GS", "LS", "RC", "RC F", "LC", "RX", "GX", "LX"],
    "Mazda": ["Miata (NA)", "Miata (NB)", "Miata (NC)", "Miata (ND)", "RX-7", "RX-8", "Mazda3", "CX-5"],
    "Mercedes-Benz": ["C-Class", "C63 AMG", "E-Class", "E63 AMG", "S-Class", "G-Class", "CLA", "GLA"],
    "Mitsubishi": ["Lancer Evo", "Eagle Talon", "Eclipse", "3000GT"],
    "Nissan": ["350Z", "370Z", "Z", "GT-R", "Silvia", "240SX", "Altima", "Maxima", "Titan"],
    "Porsche": ["911", "Cayman", "Boxster", "Panamera", "Macan", "Cayenne"],
    "Subaru": ["WRX", "WRX STI", "BRZ", "Impreza", "Forester", "Outback", "Crosstrek"],
    "Toyota": ["Supra", "GR86", "Corolla GR", "Tacoma", "Tundra", "4Runner", "Camry", "Land Cruiser", "MR2"],
    "Volkswagen": ["GTI", "Golf R", "Jetta", "Passat", "Tiguan", "Atlas"],
}

export const getModels = (make: string) => MAKES_AND_MODELS[make] || []
