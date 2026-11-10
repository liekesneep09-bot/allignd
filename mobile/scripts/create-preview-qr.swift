import AppKit
import CoreImage

let address = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "exp://192.168.2.31:8082"
let output = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : "expo-go-qr.png"

guard let data = address.data(using: .utf8),
      let filter = CIFilter(name: "CIQRCodeGenerator") else {
    fatalError("Could not prepare QR input")
}

filter.setValue(data, forKey: "inputMessage")
filter.setValue("H", forKey: "inputCorrectionLevel")

guard let code = filter.outputImage else {
    fatalError("Could not generate QR code")
}

let scaled = code.transformed(by: CGAffineTransform(scaleX: 12, y: 12))
let representation = NSCIImageRep(ciImage: scaled)
let image = NSImage(size: representation.size)
image.addRepresentation(representation)

guard let tiff = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let png = bitmap.representation(using: .png, properties: [:]) else {
    fatalError("Could not encode QR image")
}

try png.write(to: URL(fileURLWithPath: output))
print(address)
